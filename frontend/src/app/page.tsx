import { redirect } from 'next/navigation'

// Root redirects straight into the chat route group
export default function RootPage() {
  redirect('/chat')
}