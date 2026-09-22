import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <h1>HII, Welcome to the SEO AUDIT</h1>

  <section id="website-form">
    <form id="urlForm">
      <input 
        type="text" 
        id="websiteInput" 
        placeholder="Enter your website" 
        required
      />
      <button type="submit" id="submitBtn">Submit</button>
    </form>
  </section>

  <div id="error-message" style="display: none; color: red; margin-top: 10px;"></div>

  <section id="response-section" style="display: none; margin-top: 30px;">
    <h2>Audit Results</h2>
    <div id="json-response" style="text-align: left; background: var(--code-bg); padding: 20px; border-radius: 6px; overflow-x: auto;"></div>
  </section>
`

const form = document.getElementById('urlForm') as HTMLFormElement | null
const input = document.getElementById('websiteInput') as HTMLInputElement | null
const errorMessage = document.getElementById('error-message') as HTMLDivElement | null
const responseSection = document.getElementById('response-section') as HTMLDivElement | null
const jsonResponse = document.getElementById('json-response') as HTMLDivElement | null

function validateUrl(url: string): boolean {
  try {
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    const parsedUrl = new URL(url)
    return urlPattern.test(parsedUrl.href)
  } catch {
    return false
  }
}

function formatJson(data: any): string {
  return JSON.stringify(data, null, 2)
}

form?.addEventListener('submit', async (e: Event) => {
  e.preventDefault()
  
  const url = input?.value.trim() || ''
  
  // Validate URL
  if (!validateUrl(url)) {
    errorMessage!.textContent = 'Please enter a valid URL (e.g., https://example.com)'
    errorMessage!.style.display = 'block'
    responseSection!.style.display = 'none'
    return
  }
  
  errorMessage!.style.display = 'none'
  
  try {
    const response = await fetch('/api/v1/audit/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // Display JSON response
    jsonResponse!.textContent = formatJson(data)
    responseSection!.style.display = 'block'
  } catch (error) {
    errorMessage!.textContent = `Error: ${error instanceof Error ? error.message : 'Failed to fetch audit results'}`
    errorMessage!.style.display = 'block'
    responseSection!.style.display = 'none'
  }
})