import L from 'leaflet'
import API from "./API";

const towns = require('../towns.json');

export default class FoxholeGeocoder {
    public API: API
    public Towns

    constructor(API: API) {
        let l = Object.keys(towns);
        this.API = API;
        this.Towns = towns;
    }

    /* distance between two strings */
    public levinshtein(a: string, b: string) {
        if (a.length == 0) return b.length;
        if (b.length == 0) return a.length;

        const matrix = [];

        // increment along the first column of each row
        for (let i = 0; i <= b.length; i++)
            matrix[i] = [i];

        // increment each column in the first row
        for (let j = 0; j <= a.length; j++)
            matrix[0][j] = j;

        // Fill in the rest of the matrix
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) == a.charAt(j - 1))
                    matrix[i][j] = matrix[i - 1][j - 1];
                else
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, // substitution
                        Math.min(matrix[i][j - 1] + 1, // insertion
                            matrix[i - 1][j] + 1)); // deletion
            }
        }

        return matrix[b.length][a.length];
    }

    /* The geocoder resolve function, name -> location */
    public geocode(q, callback, context) {
        const query = q.toLowerCase();
        const townkey = Object.keys(towns).find(key => key.toLowerCase() === query);
        if (townkey != null) {
            const town = towns[townkey];
            let call = callback.bind(context);
            const value = {
                center: L.latLng(town.y, town.x),
                name: query,
                bbox: L.latLngBounds(L.latLng(town.y, town.x), L.latLng(town.y, town.x))
            };
            return call([value], []);
        } else {
            let call = callback.bind(context);
            return call([], []);
        }
    }

    public lookup(q) {
        let query = "major-".concat(q.toLowerCase());
        let townkey = Object.keys(towns).find(key => key.toLowerCase() === query);
        if (townkey != null) {
            const town = towns[townkey];
            return {x: town.x + 128, y: town.y - 128};
        }

        query = "minor-".concat(q.replace(/ \(area\)$/i, '').toLowerCase());
        townkey = Object.keys(towns).find(key => key.toLowerCase() === query);
        if (townkey != null) {
            const town = towns[townkey];
            return {x: town.x + 128, y: town.y - 128};
        }

        return null;
    }

    /* The geocoding reverse lookup - nearest point */
    public reverseExact(location) {
        const region = this.API.calculateRegion(location.lng, location.lat);
        location = {lng: location.lng - 128, lat: location.lat + 128};
        const townlist = Object.keys(towns);
        if (townlist.length === 0)
            return null;

        for (let i = 0; i < townlist.length; i++)
            if (towns[townlist[i]].region === region)
                if (location.lat == towns[townlist[i]].y && location.lng == towns[townlist[i]].x)
                    return towns[townlist[i]].name.concat(towns[townlist[i]].major == 0 ? ' (area)' : '');
        return null;
    }

    /* The geocoding reverse lookup - nearest point */
    public reverse(location, scale, callback, context) {
        const region = this.API.calculateRegion(location.lng, location.lat);
        location = {lng: location.lng - 128, lat: location.lat + 128};
        let call = callback.bind(context);
        const townlist = Object.keys(towns);
        if (townlist.length === 0)
            return call([], []);
        let distance = -1;
        let index = -1;
        for (let i = 0; i < townlist.length; i++) {
            if (towns[townlist[i]].region === region) {
                const disty = (location.lat - towns[townlist[i]].y);
                const distx = (location.lng - towns[townlist[i]].x);
                const dist_squared = distx * distx + disty * disty;
                if (distance < 0 || dist_squared < distance) {
                    distance = dist_squared;
                    index = i;
                }
            }
        }
        if (index == -1)
            return call([], []);

        const town = towns[townlist[index]];
        const value = {
            center: L.latLng(town.y - 128, town.x + 128),
            name: town.name.concat(town.major == 0 ? ' (area)' : ''),
            bbox: L.latLngBounds(L.latLng(town.y - 128, town.x + 128), L.latLng(town.y, town.x))
        };
        return call([value], []);
    }

    /* Auto-suggest using indexof and levinshtein distance */
    public suggest(q, callback, context) {
        let i;
        const query = q.toLowerCase();
        let call = callback.bind(context);
        const townlist = Object.keys(towns);
        if (townlist.length === 0)
            return call([], []);
        const results = [];
        for (i = 0; i < townlist.length; i++) {
            const townname = towns[townlist[i]].name.toLowerCase();
            if (townname.indexOf(query) >= 0) {
                const d = this.levinshtein(query, townname);
                results.push({
                    key: townlist[i],
                    name: towns[townlist[i]].name.concat(towns[townlist[i]].major == 0 ? " (area)" : ""),
                    distance: d
                });
            }
        }
        results.sort(x => x.distance);
        const output = [];
        for (i = 0; i < 5 && i < results.length; i++) {
            const town = towns[results[i].key];
            output.push({
                center: L.latLng(town.y - 128, town.x + 128),
                name: results[i].name,
                bbox: L.latLngBounds(L.latLng(town.y - 128, town.x + 128), L.latLng(town.y - 128, town.x + 128))
            });
        }
        return call(output, []);
    }
}