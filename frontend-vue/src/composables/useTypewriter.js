
import { ref, watch, onUnmounted } from 'vue'

export function useTypewriter(text, speed = 20) {
    const displayedText = ref('')
    const isTyping = ref(false)
    let timer = null

    const startTyping = (content) => {
        if (!content) {
            content = ''
        }
        displayedText.value = ''
        isTyping.value = true
        let i = 0

        clearInterval(timer)
        timer = setInterval(() => {
            if (i < content.length) {
                displayedText.value += content.charAt(i)
                i++
            } else {
                clearInterval(timer)
                isTyping.value = false
            }
        }, speed)
    }

    const setImmediate = (content) => {
        clearInterval(timer)
        displayedText.value = content
        isTyping.value = false
    }

    onUnmounted(() => {
        clearInterval(timer)
    })

    return {
        displayedText,
        isTyping,
        startTyping,
        setImmediate
    }
}
