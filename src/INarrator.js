define(null, function () {
    return {
        Narrator: function () {
            var ss = window.speechSynthesis;
            var voices = window.speechSynthesis.getVoices();
            var selected_voice = voices[0];//Math.round(Math.random() * 1000).toFixed() % voices.length];
            var Narrator = {
                speechSynthesis: ss,
                voices: voices,
                selectedVoice: selected_voice,
                instructions: [],
                speak: function (text) {
                    var utter = new SpeechSynthesisUtterance();
                    utter.rate = 1.2;
                    utter.pitch = 0.65;
                    utter.text = text;
                    utter.voice = Narrator.selectedVoice;
                    Narrator.speechSynthesis.speak(utter);
                },
                clearInstructions: function () {
                    Narrator.instructions.splice(0, Narrator.instructions.length);
                }
            };
            return Narrator;
        }
    };
});