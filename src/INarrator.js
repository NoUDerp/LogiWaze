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
                currentInstruction: -1,
                paused: false,
                speed: 1.0,
                setSpeed: function (speed) {
                    Narrator.speed = speed;
                },
                speak: function (text) {
                    var utter = new SpeechSynthesisUtterance();
                    utter.rate = 1.2;
                    utter.pitch = 1.0;
                    utter.volume = .5;
                    utter.text = text;
                    utter.voice = Narrator.selectedVoice;
                    Narrator.speechSynthesis.speak(utter);
                },

                clearInstructions: function () {
                    Narrator.instructions = [];
                    this.currentInstruction = -1;
                },

                giveDirections: function (instructions) {
                    var time = 0;
                    if (instructions.length == Narrator.instructions.length) {
                        var clear = false;
                        for (var i = 0; i < instructions.length; i++)
                            if (instructions[i] != Narrator.instructions[i]) {
                                clear = true;
                                break;
                            }
                    }

                    //if (clear)
                    Narrator.clearInstructions();

                    for (var i = 0; i < instructions.length; i++) {
                        var direction = instructions[i];
                        var text = direction.text.split(/\|/)[1];
                        var border = instructions[i].border;



                        var delta = i == 0 ? 0.0 : (instructions[i - 1].distance / 35000.0) * 3600.0;
                        if (border) {
                            Narrator.instructions.push({ time: delta, text: "You are approaching a border crossing, check your radio" });
                            Narrator.instructions.push({ time: 0, text: text });
                        }
                        else
                            Narrator.instructions.push({ time: delta, text: text });
                        time += delta;
                    }
                    Narrator.queueNextInstruction();
                },
                pauseNarration: function () {

                },
                resumeNarration: function () {

                },
                queueNextInstruction: function () {
                    if (Narrator.instructions === null || Narrator.instructions.length == 0)
                        return;

                    var index = ++Narrator.currentInstruction;

                    var f = document.getElementsByClassName("narrator-step-".concat(index - 1));
                    if (f != null && f.length > 0) {
                        f[0].style.background = null;
                        f[0].style.color = null;
                    }

                    var f = document.getElementsByClassName("narrator-step-".concat(index));
                    if (f != null && f.length > 0) {
                        f[0].style.background = "#666666"
                        f[0].style.color = "#FFFFFF"
                    }


                    const direction = Narrator.instructions[index];
                    setTimeout(function () {

                        Narrator.queueNextInstruction();
                        Narrator.speak(direction.text);
                    }, direction.time * 1000.0 / Narrator.speed);
                }
            };
            return Narrator;
        }
    };
});