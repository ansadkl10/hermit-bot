const {
  Function,
  addAudioMetaData,
  isUrl,
  getBuffer,
  prefix,
  isPublic,
  ytIdRegex,
  getJson,
  toAudio,
  h2k
} = require('../lib/');
const yts = require("yt-search");
const config = require('../config');
const fs = require('fs');

// --- AUDIO COMMANDS (play, song, yta) ---

Function({
  pattern: 'play ?(.*)',
  fromMe: isPublic,
  desc: 'play youtube audio',
  type: 'download'
}, async (message, match, client) => {
  match = match || message.reply_message.text;
  if (!match) return await message.reply('*Need text!*\n_Example: .play astronaut in the ocean_');
  
  try {
    const search = await yts(match);
    if (search.videos.length < 1) return await message.reply('_No results found_');
    
    const video = search.videos[0];
    const apiUrl = `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(video.url)}&format=mp3`;
    
    await message.reply(`_Downloading: ${video.title}_`);
    
    const result = await getJson(apiUrl);
    
    if (!result.success) {
      return await message.reply('_Failed to download audio_');
    }
    
    const audioBuffer = await getBuffer(result.downloadURL);
    // Thumbnail search result-ൽ നിന്ന് തന്നെ എടുക്കാം
    const thumbBuffer = await getBuffer(video.thumbnail);
    
    const writer = await addAudioMetaData(
      await toAudio(audioBuffer),
      thumbBuffer,
      result.title,
      `${config.BOT_INFO.split(";")[0]}`,
      'Hermit Official'
    );
    
    await message.client.sendMessage(message.jid, {
      audio: writer,
      mimetype: 'audio/mpeg'
    }, { quoted: message.data });
    
  } catch (error) {
    console.error('Error:', error);
    return message.reply(`Error: ${error.message || 'Unknown error occurred'}`);
  }
});

Function({
  pattern: 'song ?(.*)',
  fromMe: isPublic,
  desc: 'Download audio from YouTube',
  type: 'download'
}, async (message, match, client) => {
  match = match || message.reply_message.text;
  if (!match) return message.reply('_Need URL or song name!_\n*Example: .song URL/song name*');
  
  try {
    let videoUrl, thumb;
    if (isUrl(match) && match.includes('youtu')) {
      videoUrl = match;
      const vid = await yts({ videoId: yts.parseArgs(match).videoId });
      thumb = vid.thumbnail;
    } else {
      const search = await yts(match);
      if (search.videos.length < 1) return await message.reply('_No results found_');
      videoUrl = search.videos[0].url;
      thumb = search.videos[0].thumbnail;
    }
    
    const apiUrl = `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(videoUrl)}&format=mp3`;
    await message.reply('_Downloading audio..._');
    
    const result = await getJson(apiUrl);
    if (!result.success) return await message.reply('_Failed to download audio_');
    
    const audioBuffer = await getBuffer(result.downloadURL);
    const thumbBuffer = await getBuffer(thumb);
    
    const writer = await addAudioMetaData(
      await toAudio(audioBuffer),
      thumbBuffer,
      result.title,
      `${config.BOT_INFO.split(";")[0]}`,
      'Hermit Official'
    );
    
    await message.client.sendMessage(message.jid, {
      audio: writer,
      mimetype: 'audio/mpeg'
    }, { quoted: message.data });
    
  } catch (error) {
    return message.reply(`Error: ${error.message}`);
  }
});

// --- VIDEO COMMANDS (video, ytv) ---

Function({
  pattern: 'video ?(.*)',
  fromMe: isPublic,
  desc: 'Download video from YouTube',
  type: 'download'
}, async (message, match, client) => {
  match = match || message.reply_message.text;
  if (!match) return message.reply('_Need URL or video name!_\n*Example: .video URL/video name*');
  
  try {
    let videoUrl;
    if (isUrl(match) && match.includes('youtu')) {
      videoUrl = match;
    } else {
      const search = await yts(match);
      if (search.videos.length < 1) return await message.reply('_No results found_');
      videoUrl = search.videos[0].url;
    }
    
    // Aswin Sparky API for Video
    const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/ytv?url=${encodeURIComponent(videoUrl)}`;
    await message.reply('_Downloading video..._');
    
    const result = await getJson(apiUrl);
    if (!result.status) return await message.reply('_Failed to download video_');
    
    await message.send(result.data.url, 'video', {
      quoted: message.data,
      caption: result.data.title
    });
    
  } catch (error) {
    return message.reply(`Error: ${error.message}`);
  }
});

// yta command (using eliteprotech)
Function({
  pattern: 'yta ?(.*)',
  fromMe: isPublic,
  desc: 'Download audio from YouTube',
  type: 'download'
}, async (message, match, client) => {
  match = match || message.reply_message.text;
  if (!match) return message.reply('_Need URL!_');
  
  try {
    const apiUrl = `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(match)}&format=mp3`;
    const result = await getJson(apiUrl);
    if (!result.success) return await message.reply('_Error_');
    
    const audioBuffer = await getBuffer(result.downloadURL);
    const writer = await addAudioMetaData(await toAudio(audioBuffer), null, result.title, "Nexa-MD", "Hermit");
    
    await message.client.sendMessage(message.jid, { audio: writer, mimetype: 'audio/mpeg' }, { quoted: message.data });
  } catch (e) { message.reply(e.message) }
});

// ytv command (using aswin-sparky)
Function({
  pattern: 'ytv ?(.*)',
  fromMe: isPublic,
  desc: 'Download video from YouTube',
  type: 'download'
}, async (message, match, client) => {
  match = match || message.reply_message.text;
  if (!match) return message.reply('_Need URL!_');
  
  try {
    const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/ytv?url=${encodeURIComponent(match)}`;
    const result = await getJson(apiUrl);
    if (!result.status) return await message.reply('_Error_');
    
    await message.send(result.data.url, 'video', { quoted: message.data, caption: result.data.title });
  } catch (e) { message.reply(e.message) }
});
