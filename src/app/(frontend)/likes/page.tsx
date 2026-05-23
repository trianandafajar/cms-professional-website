import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Liked Events | Eventbro',
  description: 'Your saved and bookmarked events',
}

export default async function LikesPage() {
  redirect('/my/likes')
}
