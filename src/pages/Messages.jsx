import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

const FAKE_CONVOS = [
  { id: 1, name: "Alex Johnson", avatar: "", lastMsg: "Hey, are you free tomorrow?", time: "2m" },
  { id: 2, name: "Sam Rivera", avatar: "", lastMsg: "The apartment looks great!", time: "1h" },
  { id: 3, name: "Jordan Lee", avatar: "", lastMsg: "Let me know about the lease", time: "3h" },
  { id: 4, name: "Taylor Kim", avatar: "", lastMsg: "Thanks for the info!", time: "1d" },
]

const FAKE_MESSAGES = [
  { id: 1, sender: "them", text: "Hey! I saw your listing on coHabit", time: "10:30 AM" },
  { id: 2, sender: "them", text: "Is the room still available?", time: "10:31 AM" },
  { id: 3, sender: "me", text: "Hi! Yes it is, want to schedule a visit?", time: "10:45 AM" },
  { id: 4, sender: "them", text: "That would be great! How about Saturday?", time: "10:46 AM" },
  { id: 5, sender: "me", text: "Saturday works. 2pm?", time: "11:00 AM" },
  { id: 6, sender: "them", text: "Perfect, see you then!", time: "11:02 AM" },
]

export default function Messages() {
  const [selected, setSelected] = useState(FAKE_CONVOS[0])
  const [input, setInput] = useState("")

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar - conversation list */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          {FAKE_CONVOS.map((convo) => (
            <div
              key={convo.id}
              onClick={() => setSelected(convo)}
              className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                selected.id === convo.id ? "bg-muted" : ""
              }`}
            >
              <Avatar>
                <AvatarImage src={convo.avatar} />
                <AvatarFallback>{convo.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <p className="font-medium text-sm">{convo.name}</p>
                  <span className="text-xs text-muted-foreground">{convo.time}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{convo.lastMsg}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Avatar>
            <AvatarFallback>{selected.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{selected.name}</p>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {FAKE_MESSAGES.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    msg.sender === "me"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setInput("")
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
