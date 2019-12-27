import {formatDistanceToNow, parseISO} from 'date-fns'

function updateTimeElements() {
  const timeElements = document.getElementsByTagName('time')
  for (const element of Array.from(timeElements)) {
    const isoDate = element.getAttribute('datetime') || ''
    const formattedDate = `${formatDistanceToNow(parseISO(isoDate))} ago`
    if (element.innerText !== formattedDate) {
      element.innerText = formattedDate
    }
  }
}

window.addEventListener('load', () => {
  updateTimeElements()
  setInterval(updateTimeElements, 60 * 1000)
})
