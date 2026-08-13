import { Component } from 'react'

// Catches errors from children (e.g. WebGL unavailable in Ballpit) so the whole
// React tree isn't unmounted. The failing subtree is dropped; siblings survive.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error) {
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="error-boundary-fallback" role="status">
          Interactive visual unavailable
        </div>
      )
    }
    return this.props.children
  }
}
