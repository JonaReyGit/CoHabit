import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { supabase } from "../lib/supabase"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import SimpleFooter from "@/components/shared/SimpleFooter";

export default function Messages() {
  const [currentUser, setCurrentUser] = useState(null)
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const viewportRef = useRef(null)
  const scrollAtBottom = useRef(true)

  // Keep a ref of the selected chat so we don't have to restart the realtime
  // subscription every single time the user clicks a different conversation.
  const selectedRef = useRef(selected)
  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  // fetch current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user.id)
      }
    })
  }, [])

  // Loads convos of accepted matches
  useEffect(() => {
    if (!currentUser) return

    async function loadConversations() {

      // get all accepted matches where current user is involved
      const { data: matches, error } = await supabase
        .from("matches")
        .select("id, user_id_1, user_id_2, compatibility_score")
        .eq("status", "accepted")
        .or(`user_id_1.eq.${currentUser},user_id_2.eq.${currentUser}`)

      if (error || !matches) return

      // Error handling for empty array of int
      if (matches.length === 0) {
        setConversations([])
        return
      }

      // figure out the other users id for each match
      const otherUserIds = matches.map((m) =>
        m.user_id_1 === currentUser ? m.user_id_2 : m.user_id_1
      )

      // fetch their profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio, location_city, location_state")
        .in("id", otherUserIds)

      const profileMap = {}
      profiles?.forEach((p) => (profileMap[p.id] = p))

      // fetch unread messages count for these conversations
      const { data: unreadData } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("receiver_id", currentUser)
        .eq("is_read", false)

      const unreadMap = {}
      unreadData?.forEach((msg) => {
        unreadMap[msg.sender_id] = (unreadMap[msg.sender_id] || 0) + 1
      })

      // builds the conversation list
      const convos = matches.map((m) => {
        const otherId = m.user_id_1 === currentUser ? m.user_id_2 : m.user_id_1
        const profile = profileMap[otherId] || {}
        return {
          matchId: m.id,
          otherUserId: otherId,
          name: profile.full_name || "Unknown",
          avatar: profile.avatar_url || "",
          score: m.compatibility_score,
          // bio info in chat
          bio: profile.bio || "No bio provided.",
          location: (profile.location_city && profile.location_state)
            ? `${profile.location_city}, ${profile.location_state}`
            : "Location not set",
          unreadCount: unreadMap[otherId] || 0,
        }
      })

      setConversations(convos)
    }

    loadConversations()
  }, [currentUser])

  // Loads the messages for each conversation
  useEffect(() => {
    if (!selected || !currentUser) return

    async function loadMessages() {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUser},receiver_id.eq.${selected.otherUserId}),and(sender_id.eq.${selected.otherUserId},receiver_id.eq.${currentUser})`
        )
        .order("created_at", { ascending: true })

      if (data) {
        setMessages(data)

        // Mark unread messages as read when we open the conversation
        const hasUnread = data.some(m => m.receiver_id === currentUser && !m.is_read);
        if (hasUnread) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('receiver_id', currentUser)
            .eq('sender_id', selected.otherUserId)
            .eq('is_read', false);

          // Update local conversations state to remove the notification badge
          setConversations(prev => prev.map(c =>
            c.matchId === selected.matchId ? { ...c, unreadCount: 0 } : c
          ));
        }
      }
    }

    loadMessages()
  }, [selected?.matchId, currentUser])

  // This effect sets up a scroll listener on the message viewport.
  // It updates a ref to track if the user is currently scrolled to the bottom.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      const isAtBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 50;
      scrollAtBottom.current = isAtBottom;
    };

    viewport.addEventListener('scroll', handleScroll);
    // Reset on conversation change

    scrollAtBottom.current = true; 
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [selected]);

  // This effect runs *after* new messages are rendered to the DOM.
  useLayoutEffect(() => {
    if (scrollAtBottom.current && viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [messages]);
  // deletes conversation and unmatches
  async function handleDeleteConversation(matchId) {
    if (!window.confirm("Are you sure you want to delete this conversation? This will unmatch you.")) return

    const { data, error } = await supabase
      .from("matches")
      .delete()
      .eq("id", matchId)
      .select()

    if (error) {
      console.error("Error deleting conversation:", error)
      alert("Could not delete the conversation.")
      return
    }

    // If no error occurred but 0 rows were returned, RLS blocked the deletion
    if (!data || data.length === 0) {
      alert("Deletion blocked by the database! You need to add a DELETE policy for the 'matches' table in Supabase.")
      return
    }

    setConversations((prev) => prev.filter((c) => c.matchId !== matchId))
    if (selected?.matchId === matchId) {
      setSelected(null)
      setMessages([])
    }
  }
   /*
  ===============================
  REAL TIME TESTING BLOCk // Remove
  before adding to production
  ===============================
  */

  // Test function to simulate receiving a message
  async function handleTestReceive() {
    if (!selected || !currentUser) {
      alert("Please select a conversation to test message receiving.");
      return;
    }

    const testMessage = {
      // sim message from the other user
      sender_id: selected.otherUserId, 
      //// Sent to you
      receiver_id: currentUser,       
      content: `:::TEST:: This is a simulated incoming message at ${new Date().toLocaleTimeString()}.`,
    };

    const { error } = await supabase.from("messages").insert(testMessage);

    if (error) {
      console.error("Test receive error:", error);
      alert(
        "Failed to create test message. This is likely due to your Row Level Security (RLS) policy. Please see the explanation on how to temporarily adjust it for testing."
      );
    }
    // If successful, the realtime subscription will pick it up and add it to the UI.
  }

  // Send Message function
  async function handleSend(e) {
    e.preventDefault()
    if (!input.trim() || !selected) return

    const newMsg = {
      sender_id: currentUser,
      receiver_id: selected.otherUserId,
      content: input.trim(),
    }

    const { data, error } = await supabase
      .from("messages")
      .insert(newMsg)
      .select()
      .single()

    if (!error && data) {
      setMessages((prev) => [...prev, data])
      setInput("")
    }
  }

  // Real Time messages subscription
  useEffect(() => {
    if (!currentUser) return

    const channel = supabase
      .channel(`messages-${currentUser}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUser}`,
        },
        (payload) => {
          const newMsg = payload.new
          const currentSelected = selectedRef.current

          // only add if from the currently selected conversation
          if (currentSelected && newMsg.sender_id === currentSelected.otherUserId) {
            setMessages((prev) => {

              // handles and manage duplications
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })
            
            // Mark it as read immediately since we are viewing this conversation
            supabase.from('messages').update({ is_read: true }).eq('id', newMsg.id).then();
          } else {
            // If it's for another conversation, increment the unread badge
            setConversations(prev => prev.map(c =>
              c.otherUserId === newMsg.sender_id ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } : c
            ))
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [currentUser])

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  function getInitials(name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)]">
      <div className="flex flex-1 overflow-hidden bg-background min-h-0">

      {/* Sidebar chat lists */}
      <div className="w-80 border-r flex flex-col bg-[#659af6] dark:bg-gray-800">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <Separator />
        <div className="flex-1 relative min-h-0">
          <ScrollArea className="absolute inset-0">
            {conversations.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">
                No matches yet. Once you match with someone, you can message them here.
              </p>
            )}
            {conversations.map((convo) => (
              <div
                key={convo.matchId}
                onClick={() => setSelected(convo)}
                className={`flex items-center gap-3 p-3 mx-3 my-2 cursor-pointer border rounded-xl transition-all ${
                  selected?.matchId === convo.matchId
                    ? "bg-white dark:bg-gray-500 border-black dark:border-white shadow-sm"
                    : "bg-blue-300 dark:bg-gray-700 border-gray-200 dark:border-black hover:border-blue-700 dark:hover:border-gray-400 hover:shadow-sm"
                }`}
              >
                <Avatar>
                  <AvatarImage src={convo.avatar} />
                  <AvatarFallback>{getInitials(convo.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium text-sm truncate pr-2">{convo.name}</p>
                    {convo.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        {convo.unreadCount > 99 ? '99+' : convo.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {convo.score}% match
                  </p>
                </div>
              </div>
            ))}
          </ScrollArea>
        </div>
      </div>

      {/* main chat area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-700">
        {selected ? (
          <>
            {/* chat head */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selected.avatar} />
                  <AvatarFallback>{getInitials(selected.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{selected.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selected.score}% compatible
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {selected.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
              {/* Testing button */}
                <Button
                  onClick={handleTestReceive}
                  variant="outline"
                  size="sm"
                  className="h-auto px-3 py-1 text-xs border-dashed"
                >
                  Test Receive
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-auto px-3 py-1 text-xs hover:border-blue-700 dark:hover:border-gray-400">
                      View Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={selected.avatar} />
                          <AvatarFallback>{getInitials(selected.name)}</AvatarFallback>
                        </Avatar>
                        {selected.name}
                      </DialogTitle>
                      <DialogDescription>
                        {selected.location} • {selected.score}% compatible
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                      <h4 className="font-semibold text-sm mb-1">Bio</h4>
                      <p className="text-sm text-muted-foreground">{selected.bio}</p>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  onClick={() => handleDeleteConversation(selected.matchId)}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 h-auto"
                >
                  Unmatch
                </Button>
              </div>
            </div>

            {/* messages */}
            <div ref={viewportRef} className="flex-1 overflow-y-auto p-4 min-h-0">
              <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_id === currentUser
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 shadow-sm ${
                          msg.sender_id === currentUser
                            ? "bg-blue-500 text-white rounded-2xl rounded-br-md"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.sender_id === currentUser
                              ? "text-blue-100"
                              : "text-gray-400 dark:text-gray-500"
                          }`}
                        >
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 hover:border-blue-700 text-white">Send</Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
      <SimpleFooter />
    </div>
  )
}
