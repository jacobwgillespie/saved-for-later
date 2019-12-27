import {formatDistanceToNow, parseISO} from 'date-fns'

function updateTimeElements() {
  const timeElements = document.getElementsByTagName('time')
  for (const element of Array.from(timeElements)) {
    const isoDate = element.getAttribute('datetime') || ''
    element.innerText = `${formatDistanceToNow(parseISO(isoDate))} ago`
  }
}

window.addEventListener('load', () => {
  updateTimeElements()
  setInterval(updateTimeElements, 60 * 1000)
})
