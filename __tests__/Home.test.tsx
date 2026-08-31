import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
    }
  },
}))

// Mock Supabase client — no longer called at module level
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: jest.fn(),
      getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
    }),
  })
}))

describe('Home', () => {
  it('renders the main heading', () => {
    render(<Home />)
    const heading = screen.getByText(/What would you like to explore today\?/i)
    expect(heading).toBeInTheDocument()
  })
})
