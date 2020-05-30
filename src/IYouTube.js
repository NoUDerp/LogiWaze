define(['leaflet'], function (L) {
	class YouTubeControl extends L.Control {
		constructor() {
			super();
			//<iframe width="560" height="315" src="https://www.youtube.com/embed/videoseries?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
		}

		//getContainer() {
		//L.Routing.ItineraryBuilder.prototype.createStepsContainer(container);
		//}

		onAdd(map) {
			var u = document.createElement("div"); u.innerHtml = "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/videoseries?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG\" frameborder=\"0\" allow=\"autoplay; encrypted-media\" allowfullscreen></iframe>";
			u.classList.add(["leaflet-routing-container", "leaflet-bar", "leaflet-control"]);//, "leaflet-bottom", "leaflet-right"]);
			return u;
			//return L.Control.prototype.onAdd(map);
		}

		onRemove(map) {
			//return L.Control.prototype.onRemove(map);
		}
	}
	return {
		YouTube: function () {
			var YouTube = {
				Control: function () {
					return new YouTubeControl();
				}
			};
			return YouTube;
		}
	};
});
