import { useState, useEffect, useRef } from "react"
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
  const messagesEndRef = useRef(null)

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

      if (data) setMessages(data)
    }

    loadMessages()
  }, [selected, currentUser])

  // auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

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
      <div className="flex flex-1 overflow-hidden bg-background">

      {/* Sidebar chat lists */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
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
                  ? "bg-blue-50 dark:bg-gray-800 border-blue-300 dark:border-blue-700 shadow-sm"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-gray-700 hover:shadow-sm"
              }`}
            >
              <Avatar>
                <AvatarImage src={convo.avatar} />
                <AvatarFallback>{getInitials(convo.name)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{convo.name}</p>
                <p className="text-xs text-muted-foreground">
                  {convo.score}% match
                </p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* main chat area */}
      <div className="flex-1 flex flex-col">
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-auto px-3 py-1 text-xs">
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
                  Delete Chat
                </Button>
              </div>
            </div>

            {/* messages */}
            <ScrollArea className="flex-1 p-4">
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
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* input */}
            <div className="p-4 border-t">
              <form onSubmit={handleSend} className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Send</Button>
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
