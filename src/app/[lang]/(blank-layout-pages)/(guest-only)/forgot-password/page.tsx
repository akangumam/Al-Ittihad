import { redirect } from 'next/navigation'

// Redirect to the active forgot-password page
const ForgotPasswordPage = () => {
  redirect('/auth/forgot-password')
}

export default ForgotPasswordPage
