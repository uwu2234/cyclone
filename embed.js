module.exports = class RichEmbed {
  constructor(data = {}) {
    /**
     * Title for this Embed
     * @type {string}
     */
    this.title = data.title;

    /**
     * Description for this Embed
     * @type {string}
     */
    this.description = data.description;

    /**
     * URL for this Embed
     * @type {string}
     */
    this.url = data.url;

    /**
     * Color for this Embed
     * @type {number}
     */
    this.color = data.color;

    /**
     * Author for this Embed
     * @type {Object}
     */
    this.author = data.author;

    /**
     * Timestamp for this Embed
     * @type {Date}
     */
    this.timestamp = data.timestamp;

    /**
     * Fields for this Embed
     * @type {Object[]}
     */
    this.fields = data.fields || [];

    /**
     * Thumbnail for this Embed
     * @type {Object}
     */
    this.thumbnail = data.thumbnail;

    /**
     * Image for this Embed
     * @type {Object}
     */
    this.image = data.image;

    /**
     * Footer for this Embed
     * @type {Object}
     */
    this.footer = data.footer;

    /**
     * File to upload alongside this Embed
     * @type {string}
     */
    this.file = data.file;
  }
  /**
   * Sets the title of this embed.
   * @param {string} title The title
   * @returns {RichEmbed} This embed
   */
  setTitle(title) {
    if (title.length > 256) throw new RangeError('RichEmbed titles may not exceed 256 characters.');
    this.title = title;
    return this;
  }

  /**
   * Sets the description of this embed.
   * @param {string} description The description
   * @returns {RichEmbed} This embed
   */
  setDescription(description) {
    if (description.length > 2048) throw new RangeError('RichEmbed descriptions may not exceed 2048 characters.');
    this.description = description;
    return this;
  }

  /**
   * Sets the URL of this embed.
   * @param {string} url The URL
   * @returns {RichEmbed} This embed
   */
  setURL(url) {
    this.url = url;
    return this;
  }

  /**
   * Sets the color of this embed.
   * @param {string} color The color of the embed
   * @returns {RichEmbed} This embed
   */
  setColor(color) {
    this.color = parseInt(color.replace('#', ''), 16)
    return this;
  }

  /**
   * Sets the author of this embed.
   * @param {string} name The name of the author
   * @param {string} [icon] The icon URL of the author
   * @param {string} [url] The URL of the author
   * @returns {RichEmbed} This embed
   */
  setAuthor(name, icon, url) {
    this.author = { name: name, icon_url: icon, url };
    return this;
  }
  /**
   * Sets the author of this embed using an Eris User object.
   * @param {User} user The Eris user to use to set the author.
   */
  setErisAuthor(user) {
    this.author = { name: `${user.username}#${user.discriminator}`, icon_url: user.avatarURL };
    return this;
  }


  /**
   * Sets the timestamp of this embed.
   * @param {Date} [timestamp=current date] The timestamp
   * @returns {RichEmbed} This embed
   */
  setTimestamp(timestamp = new Date()) {
    this.timestamp = timestamp;
    return this;
  }

  /**
   * Adds a field to the embed (max 25).
   * @param {string} name The name of the field
   * @param {string} value The value of the field
   * @param {boolean} [inline=false] Set the field to display inline
   * @returns {RichEmbed} This embed
   */
  addField(name, value, inline = false) {
    if (this.fields.length >= 25) throw new RangeError('RichEmbeds may not exceed 25 fields.');
    if (name.length > 256) throw new RangeError('RichEmbed field names may not exceed 256 characters.');
    if (!/\S/.test(name)) throw new RangeError('RichEmbed field names may not be empty.');
    if (value.length > 1024) {
      value = value.substr(0, 1021) + '...'
    }
    if (value.length > 1024) throw new RangeError('RichEmbed field values may not exceed 1024 characters.');
    if (!/\S/.test(value)) throw new RangeError('RichEmbed field values may not be empty.');
    this.fields.push({ name, value, inline });
    return this;
  }

  /**
   * Convenience function for `<RichEmbed>.addField('\u200B', '\u200B', inline)`.
   * @param {boolean} [inline=false] Set the field to display inline
   * @returns {RichEmbed} This embed
   */
  addBlankField(inline = false) {
    return this.addField('\u200B', '\u200B', inline);
  }

  /**
   * Set the thumbnail of this embed.
   * @param {string} url The URL of the thumbnail
   * @returns {RichEmbed} This embed
   */
  setThumbnail(url) {
    this.thumbnail = { url };
    return this;
  }

  /**
   * Set the image of this embed.
   * @param {string} url The URL of the image
   * @returns {RichEmbed} This embed
   */
  setImage(url) {
    this.image = { url };
    return this;
  }

  /**
   * Sets the footer of this embed.
   * @param {string} text The text of the footer
   * @param {string} [icon] The icon URL of the footer
   * @returns {RichEmbed} This embed
   */
  setFooter(text, icon) {
    if (text.length > 2048) throw new RangeError('RichEmbed footer text may not exceed 2048 characters.');
    this.footer = { text, icon_url: icon };
    return this;
  }

  toJSON() {
    let j = {}
    j.title = this.title
    j.type = this.type
    j.description = this.description
    j.url = this.url
    j.timestamp = this.timestamp
    j.color = this.color
    j.footer = this.footer
    j.image = this.image
    j.thumbnail = this.thumbnail
    j.author = this.author
    j.fields = this.fields
    return j
  }
}


