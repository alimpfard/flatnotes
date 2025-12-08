import router from "./router.js";

class Note {
  constructor(note) {
    this.title = note?.title;
    this.lastModified = note?.lastModified;
    this.content = note?.content;
    this.sharingStatus = note?.sharingStatus || { shared: false, writeable: false };
  }

  get lastModifiedAsDate() {
    return new Date(this.lastModified * 1000);
  }

  get lastModifiedAsString() {
    return this.lastModifiedAsDate.toLocaleString();
  }

  get sharingMode() {
    if (!this.sharingStatus.shared) {
      return "private";
    } else if (this.sharingStatus.writeable) {
      return "shared-editable";
    } else {
      return "shared-readonly";
    }
  }
}

class SearchResult extends Note {
  constructor(searchResult) {
    super(searchResult);
    this.score = searchResult.score;
    this.titleHighlights = searchResult.titleHighlights;
    this.contentHighlights = searchResult.contentHighlights;
    this.tagMatches = searchResult.tagMatches;
  }

  get titleHighlightsOrTitle() {
    return this.titleHighlights ? this.titleHighlights : this.title;
  }

  get includesHighlights() {
    if (
      this.titleHighlights ||
      this.contentHighlights ||
      (this.tagMatches != null && this.tagMatches.length)
    ) {
      return true;
    } else {
      return false;
    }
  }
}

export { Note, SearchResult };
