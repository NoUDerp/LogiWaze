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
                    utter.pitch = 1.0;//0.65;
                    utter.text = text;
                    utter.voice = Narrator.selectedVoice;
                    Narrator.speechSynthesis.speak(utter);
                },
                clearInstructions: function () {
                    Narrator.instructions.splice(0, Narrator.instructions.length);
                },
                giveDirections: function (instructions) {
                    var time = 0;
                    Narrator.clearInstructions();
                    for (var i = 0; i < instructions.length; i++) {
                        var direction = instructions[i];
                        var delta = i == 0 ? 0.0 : (instructions[i - 1].distance / 35000.0) * 3600.0;
                        Narrator.instructions.push(
                            {
                                time: delta,
                                text: direction.text
                            }
                        );
                        time += delta;
                    }
                    Narrator.queueNextInstruction();
                },
                queueNextInstruction: function () {
                    if (Narrator.instructions === null || Narrator.instructions.length == 0)
                        return;

                    const direction = Narrator.instructions[0];
                    Narrator.instructions.splice(0, 1);
                    setTimeout(function () {

                        Narrator.queueNextInstruction();
                        Narrator.speak(direction.text);
                    }, direction.time * 1000.0);
                }
            };
            return Narrator;
        }
    };
});