import {Howl, Howler} from 'howler';
import {createReducer} from "reduxsauce";
import _ from "underscore";

import {Types} from "./actions";

/*
 * Validations
 */

export const validKey = (key) => {
  return typeof key == "string";
}

export const validName = (name) => {
  return typeof name == "string" && name.endsWith(".mp3");
}

export const validPriority = (priority) => {
  return typeof priority == "number" && priority >= 1 && priority <= 100;
}

export const validTag = (tag) => {
  return typeof tag == "string";
}

export const validType = (type) => {
  return type == "music" || type == "sound";
}

export const validUrl = (url) => {
  return typeof url == "string" && (url.startsWith("http://") || url.startsWith("https://"));
}

export class Filter {
  constructor(attrs) {
    if (validName(attrs.name)) {
      this.name = attrs.name;
    }

    if (validType(attrs.type)) {
      this.type = attrs.type;
    }

    if (validTag(attrs.tag)) {
      this.tag = attrs.tag;
    }

    if (validPriority(attrs.priority)) {
      this.priority = attrs.priority;
    }

    if (validKey(attrs.key)) {
      this.key = attrs.key;
    }
  }

  matches(filter) {
    let matchKeys = ["type", "name", "tag", "key"];

    matchKeys = _.filter(matchKeys, (key) => {
      return key in filter;
    });

    let matchedKeys = _.all(matchKeys, (key) => {
      return filter[key] == this[key];
    });

    return matchedKeys && this.priorityMatch(filter);
  }

  /*
   * Private-ish
   */

  priorityMatch(filter) {
    if (!filter.priority) {
      return true;
    }

    if (!this.priority) {
      return false;
    }

    if (this.priority <= filter.priority) {
      return true;
    }

    return false;
  }
}

export class Player {
  constructor() {
    this.activeMedia = [];
  }

  play(media) {
    _.each(this.activeMedia, (activeMedia) => {
      if (activeMedia.key == media.key) {
        activeMedia.stop();
      }
    });

    this.activeMedia = _.reject(this.activeMedia, (activeMedia) => {
      return activeMedia.key == media.key;
    });

    media.play();

    this.activeMedia.push(media);
  }

  stop(filter) {
    filter = new Filter(filter);

    _.filter(this.activeMedia, (activeMedia) => {
      return activeMedia.matchFilter(filter);
    }).map((media) => {
      media.stop()
    });

    this.activeMedia = _.reject(this.activeMedia, (activeMedia) => {
      return !activeMedia.isPlaying();
    });
  }
}

const baseUrl = (attrs, defaults) => {
  let url;

  if ("url" in attrs && validUrl(attrs.url)) {
    url = attrs.url;
  } else if ("url" in defaults && validUrl(defaults.url)) {
    url = defaults.url;
  }

  if (url && !url.endsWith("/")) {
    url = url + "/";
  }

  return url;
}

export class Media {
  constructor(attrs, defaults = {}) {
    this.filter = new Filter(attrs);

    this.type = this.filter.type;
    this.key = this.filter.key;
    this.priority = this.filter.priority;
    this.tag = this.filter.tag;
    this.name = this.filter.name;

    if (baseUrl(attrs, defaults)) {
      this.url = baseUrl(attrs, defaults) + this.filter.name;
    } else {
      throw "Invalid URL! Music cannot be played";
    }

    this.howler = new Howl({
      src: [this.url],
      html5: true
    });
  }

  isPlaying() {
    return this.howler.playing();
  }

  play() {
    console.log("playing");
    this.howler.play();
  }

  matchFilter(filter) {
    return this.filter.matches(filter);
  }

  stop() {
    console.log("stopping");
    this.howler.stop();
  }
}

const INITIAL_STATE = {
  defaults: {},
  player: new Player(),
}

export const mediaReceiveGMCP = (state, action) => {
  let key;

  switch (action.message) {
    case "Client.Media.Default":
      let defaults = {};

      if (validUrl(action.data.url)) {
        defaults.url = action.data.url;
      }

      return {...state, defaults: defaults};

    case "Client.Media.Play":
      console.log("Want to play music...");
      console.log(action);

      let media = new Media(action.data, state.defaults);

      state.player.play(media);

      return state;

    case "Client.Media.Stop":
      state.player.stop(action.data);
      return state;

    default:
      return state;
  }
};

export const HANDLERS = {
  [Types.SOCKET_RECEIVE_GMCP]: mediaReceiveGMCP,
}

export const mediaReducer = createReducer(INITIAL_STATE, HANDLERS);
