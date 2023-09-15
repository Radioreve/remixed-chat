import { Link } from "@remix-run/react"

export default function About() {
  return (
    <>
      <Link to="/">← Go back - </Link>
      <div>Hello about</div>
    </>
  )
}
