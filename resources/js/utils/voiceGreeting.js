export function playVoiceGreeting(attendeeName, { onError } = {}) {
    if (typeof window === 'undefined') {
        return false;
    }

    const normalizedName = attendeeName?.trim();

    if (!normalizedName) {
        onError?.('Voice greeting skipped because the attendee name is unavailable.');
        return false;
    }

    if (
        !('speechSynthesis' in window) ||
        typeof window.SpeechSynthesisUtterance === 'undefined'
    ) {
        onError?.('Voice greeting is not available in this browser.');
        return false;
    }

    try {
        const utterance = new window.SpeechSynthesisUtterance(`Welcome, ${normalizedName}.`);

        utterance.lang = 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;
        utterance.volume = 1;
        utterance.onerror = () => {
            onError?.('Voice greeting could not be played on this device.');
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);

        return true;
    } catch (error) {
        onError?.('Voice greeting could not be started.');
        return false;
    }
}
