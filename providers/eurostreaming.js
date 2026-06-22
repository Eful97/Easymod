var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// src/formatter.js
var require_formatter = __commonJS({
  "src/formatter.js"(exports2, module2) {
    function normalizePlaybackHeaders(headers) {
      if (!headers || typeof headers !== "object") return headers;
      const normalized = {};
      for (const [key, value] of Object.entries(headers)) {
        if (value == null) continue;
        const lowerKey = String(key).toLowerCase();
        if (lowerKey === "user-agent") normalized["User-Agent"] = value;
        else if (lowerKey === "referer" || lowerKey === "referrer") normalized["Referer"] = value;
        else if (lowerKey === "origin") normalized["Origin"] = value;
        else if (lowerKey === "accept") normalized["Accept"] = value;
        else if (lowerKey === "accept-language") normalized["Accept-Language"] = value;
        else normalized[key] = value;
      }
      return normalized;
    }
    function shouldForceNotWebReadyForPlugin(stream, providerName, headers, behaviorHints) {
      const text = [
        stream == null ? void 0 : stream.url,
        stream == null ? void 0 : stream.name,
        stream == null ? void 0 : stream.title,
        stream == null ? void 0 : stream.server,
        providerName
      ].filter(Boolean).join(" ").toLowerCase();
      if (text.includes("loadm") || text.includes("loadm.cam") || text.includes("mixdrop") || text.includes("mxcontent")) {
        return true;
      }
      return false;
    }
    function normalizeProviderId(providerName) {
      const normalized = String(providerName || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "");
      return normalized || void 0;
    }
    function formatStream2(stream, providerName) {
      let quality = stream.quality || "";
      if (quality === "2160p") quality = "\u{1F525}4K UHD";
      else if (quality === "1440p") quality = "\u2728 QHD";
      else if (quality === "1080p") quality = "\u{1F680} FHD";
      else if (quality === "720p") quality = "\u{1F4BF} HD";
      else if (quality === "576p" || quality === "480p" || quality === "360p" || quality === "240p") quality = "\u{1F4A9} Low Quality";
      else if (!quality || ["auto", "unknown", "unknow"].includes(String(quality).toLowerCase())) quality = "\u{1F4BF} HD";
      let title = `\u{1F4C1} ${stream.title || "Stream"}`;
      let language = stream.language;
      if (language === "Italian") {
        language = "\u{1F1EE}\u{1F1F9}";
      } else if (stream.name && (stream.name.includes("SUB ITA") || stream.name.includes("SUB"))) {
        language = "\u{1F1EF}\u{1F1F5} \u{1F1EE}\u{1F1F9}";
      } else if (stream.title && (stream.title.includes("SUB ITA") || stream.title.includes("SUB"))) {
        language = "\u{1F1EF}\u{1F1F5} \u{1F1EE}\u{1F1F9}";
      } else if (language === void 0 || language === null) {
        language = "";
      }
      let details = [];
      if (stream.size) details.push(`\u{1F4E6} ${stream.size}`);
      const desc = details.join(" | ");
      let pName = stream.name || stream.server || providerName;
      if (pName) {
        pName = pName.replace(/\s*\[?\(?\s*SUB\s*ITA\s*\)?\]?/i, "").replace(/\s*\[?\(?\s*ITA\s*\)?\]?/i, "").replace(/\s*\[?\(?\s*SUB\s*\)?\]?/i, "").replace(/\(\s*\)/g, "").replace(/\[\s*\]/g, "").trim();
      }
      if (pName === providerName) {
        pName = pName.charAt(0).toUpperCase() + pName.slice(1);
      }
      if (pName) {
        pName = `\u{1F4E1} ${pName}`;
      }
      const behaviorHints = stream.behaviorHints && typeof stream.behaviorHints === "object" ? __spreadValues({}, stream.behaviorHints) : {};
      let finalHeaders = stream.headers;
      if (behaviorHints.proxyHeaders && behaviorHints.proxyHeaders.request) {
        finalHeaders = behaviorHints.proxyHeaders.request;
      } else if (behaviorHints.headers) {
        finalHeaders = behaviorHints.headers;
      }
      finalHeaders = normalizePlaybackHeaders(finalHeaders);
      const isStreamingCommunityProvider = String(providerName || "").toLowerCase() === "streamingcommunity" || String((stream == null ? void 0 : stream.name) || "").toLowerCase().includes("streamingcommunity");
      if (isStreamingCommunityProvider && !finalHeaders) {
        delete behaviorHints.proxyHeaders;
        delete behaviorHints.headers;
        delete behaviorHints.notWebReady;
      }
      if (finalHeaders) {
        behaviorHints.proxyHeaders = behaviorHints.proxyHeaders || {};
        behaviorHints.proxyHeaders.request = finalHeaders;
        behaviorHints.headers = finalHeaders;
      }
      const providerExplicitNotWebReady = stream.behaviorHints && "notWebReady" in stream.behaviorHints;
      const shouldForceNotWebReady = shouldForceNotWebReadyForPlugin(stream, providerName, finalHeaders, behaviorHints);
      if (!isStreamingCommunityProvider && shouldForceNotWebReady) {
        behaviorHints.notWebReady = true;
      } else if (!providerExplicitNotWebReady) {
        delete behaviorHints.notWebReady;
      }
      const finalName = pName;
      let finalTitle = `\u{1F4C1} ${stream.title || "Stream"}`;
      if (desc) finalTitle += ` | ${desc}`;
      if (language) finalTitle += ` | ${language}`;
      const playbackReferer = stream.referer || (finalHeaders == null ? void 0 : finalHeaders.Referer) || (finalHeaders == null ? void 0 : finalHeaders.referer);
      const playbackUserAgent = stream.userAgent || (finalHeaders == null ? void 0 : finalHeaders["User-Agent"]) || (finalHeaders == null ? void 0 : finalHeaders["user-agent"]);
      return __spreadProps(__spreadValues({}, stream), {
        // Keep original properties
        name: finalName,
        title: finalTitle,
        providerName: pName,
        qualityTag: quality,
        description: desc,
        originalTitle: stream.title || "Stream",
        language,
        // Mark as formatted
        _nuvio_formatted: true,
        behaviorHints,
        provider: stream.provider || normalizeProviderId(providerName),
        referer: playbackReferer,
        userAgent: playbackUserAgent,
        // Explicitly ensure root headers are preserved for Nuvio
        headers: finalHeaders
      });
    }
    module2.exports = { formatStream: formatStream2 };
  }
});

// src/eurostreaming/index.js
var ES_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";
var formatStream = require_formatter().formatStream;
if (typeof URL === "undefined") {
  URL = function(uri, base) {
    var resolved = uri;
    if (base) {
      if (uri.indexOf("://") < 0) {
        var baseParts = base.match(/^(https?:\/\/[^\/]+)(.*)$/);
        var baseOrigin = baseParts ? baseParts[1] : "";
        var basePath = baseParts ? baseParts[2] : "";
        if (uri.startsWith("//")) {
          resolved = (base.startsWith("https") ? "https:" : "http:") + uri;
        } else if (uri.startsWith("/")) {
          resolved = baseOrigin + uri;
        } else {
          var dir = basePath.substring(0, basePath.lastIndexOf("/") + 1);
          resolved = baseOrigin + dir + uri;
        }
      }
    }
    var m = resolved.match(/^(https?):\/\/([^\/?:#]+)(?::(\d+))?([^?#]*)(\?[^#]*)?(#.*)?$/);
    if (!m) throw new Error("Invalid URL: " + resolved);
    this.href = resolved;
    this.protocol = m[1] + ":";
    this.hostname = m[2];
    this.port = m[3] || "";
    this.host = this.hostname + (this.port ? ":" + this.port : "");
    this.pathname = m[4] || "/";
    this.search = m[5] || "";
    this.hash = m[6] || "";
    this.origin = m[1] + "://" + this.host;
  };
}
var MD_HOSTS = [
  "mixdrop.vip",
  "mixdrop.ps",
  "mixdrop.ch",
  "mixdrop.to",
  "mixdrop.club",
  "mixdrop.is",
  "mixdrop.sb",
  "mixdrop.co",
  "mixdrop.ag",
  "mixdrop.net",
  "m1xdrop.net",
  "mxdrop.net",
  "miixdrop.net"
];
var MD_PAT = "m[i1!\xEC]{1,2}[x\xD7][ _-]?d[r]{1,2}[o0\xF8][ _-]?p";
function _decodeEntities(s) {
  if (!s) return "";
  return s.replace(/&quot;/g, '"').replace(/&#0?34;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}
function _resolveUrl(href, base) {
  try {
    return new URL(href, base).href;
  } catch (e) {
    return null;
  }
}
function _buildProxyUrl(rawUrl, referer, ua, origin) {
  try {
    var urlObj = new URL(rawUrl);
    var destOrigin = urlObj.origin;
    var pathnameAndSearch = urlObj.pathname + urlObj.search;
    var opts = "d=" + encodeURIComponent(destOrigin) + "&h=" + encodeURIComponent("User-Agent:" + (ua || ES_UA)) + "&h=" + encodeURIComponent("Referer:" + referer);
    if (origin) {
      opts += "&h=" + encodeURIComponent("Origin:" + origin);
    }
    return "/proxy/" + opts + pathnameAndSearch;
  } catch (e) {
    return rawUrl;
  }
}
function _streamFromProxyUrl(rawUrl) {
  var url = String(rawUrl || "");
  if (url.indexOf("/proxy/") !== 0) return { url, headers: null };
  var body = url.slice("/proxy/".length);
  var pathIndex = body.indexOf("/");
  if (pathIndex < 0) return { url, headers: null };
  var query = body.slice(0, pathIndex);
  var path = body.slice(pathIndex);
  var params = new URLSearchParams(query);
  var origin = params.get("d");
  if (!origin) return { url, headers: null };
  var headers = {};
  var headerRows = params.getAll("h");
  for (var i = 0; i < headerRows.length; i++) {
    var row = headerRows[i];
    var splitAt = row.indexOf(":");
    if (splitAt <= 0) continue;
    var key = row.slice(0, splitAt);
    var value = row.slice(splitAt + 1);
    headers[key] = value;
  }
  return {
    url: origin.replace(/\/+$/, "") + path,
    headers
  };
}
function _formatEurostreamingStreams(streams, season, episode) {
  if (!Array.isArray(streams)) return [];
  var effectiveSeason = Number(season) || 1;
  var effectiveEpisode = Number(episode) || 1;
  return streams.map(function(stream) {
    if (!stream || !stream.url) return null;
    var parsed = _streamFromProxyUrl(stream.url);
    var hostLabel = stream.title || "Stream";
    return formatStream({
      url: parsed.url,
      headers: parsed.headers || stream.headers || null,
      name: "Eurostreaming - " + hostLabel,
      title: "Serie " + effectiveSeason + "x" + effectiveEpisode,
      quality: stream.quality || "720p",
      type: /\.m3u8(?:[?#].*)?$/i.test(String(parsed.url || "")) ? "hls" : "direct",
      language: "Italian",
      behaviorHints: stream.behaviorHints || { notWebReady: true },
      provider: "eurostreaming"
    }, "Eurostreaming");
  }).filter(Boolean);
}
function _sleep(ms) {
  return new Promise(function(r) {
    setTimeout(r, ms);
  });
}
var _cookieJar = {};
function _jarSet(url, setCookieHeader, jar) {
  if (!setCookieHeader) return;
  var parts = setCookieHeader.split(";");
  var first = parts[0].split("=");
  var name = first[0].trim();
  var value = first.slice(1).join("=").trim();
  if (!name) return;
  var domain = null;
  for (var i = 1; i < parts.length; i++) {
    var p = parts[i].trim().split("=");
    if (p[0].toLowerCase().trim() === "domain" && p[1]) {
      domain = p[1].trim().toLowerCase();
      if (domain.charAt(0) === ".") domain = domain.substring(1);
    }
  }
  if (!domain) {
    try {
      domain = new URL(url).hostname;
    } catch (e) {
      return;
    }
  }
  var activeJar = jar || _cookieJar;
  if (!activeJar[domain]) activeJar[domain] = {};
  activeJar[domain][name] = value;
}
function _jarGet(url, jar) {
  try {
    var host = new URL(url).hostname;
    var parts = host.split(".");
    var cookies = [];
    var activeJar = jar || _cookieJar;
    for (var i = 0; i < parts.length; i++) {
      var dom = parts.slice(i).join(".");
      if (activeJar[dom]) {
        for (var name in activeJar[dom]) {
          cookies.push(name + "=" + activeJar[dom][name]);
        }
      }
    }
    return cookies.join("; ");
  } catch (e) {
    return "";
  }
}
function _extractCookies(r, finalUrl, jar) {
  try {
    if (!r.headers) return;
    var all = typeof r.headers.getSetCookie === "function" ? r.headers.getSetCookie() : null;
    if (all && all.length) {
      for (var i = 0; i < all.length; i++) _jarSet(finalUrl, all[i], jar);
      return;
    }
    if (typeof r.headers.forEach === "function") {
      r.headers.forEach(function(v, k) {
        if (k.toLowerCase() === "set-cookie") _jarSet(finalUrl, v, jar);
      });
    } else if (typeof r.headers.get === "function") {
      var sc = r.headers.get("set-cookie") || r.headers.get("Set-Cookie");
      if (sc) _jarSet(finalUrl, sc, jar);
    }
  } catch (e) {
  }
}
function _fetchDirectOrProxy(curUrl, fetchOpts) {
  if (curUrl.includes("clicka.cc") || curUrl.includes("safego.cc")) {
    var proxyUrl = "https://vidclick.leanhhu061208-775.workers.dev/?url=" + encodeURIComponent(curUrl);
    var proxyOpts = {};
    for (var k in fetchOpts) proxyOpts[k] = fetchOpts[k];
    proxyOpts.headers = {};
    for (var h in fetchOpts.headers) proxyOpts.headers[h] = fetchOpts.headers[h];
    proxyOpts.headers["User-Agent"] = ES_UA;
    proxyOpts.headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8";
    proxyOpts.headers["Accept-Language"] = "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7";
    proxyOpts.headers["Sec-Ch-Ua"] = '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"';
    proxyOpts.headers["Sec-Ch-Ua-Mobile"] = "?0";
    proxyOpts.headers["Sec-Ch-Ua-Platform"] = '"Windows"';
    proxyOpts.headers["Sec-Fetch-Dest"] = "document";
    proxyOpts.headers["Sec-Fetch-Mode"] = "navigate";
    proxyOpts.headers["Sec-Fetch-Site"] = "none";
    proxyOpts.headers["Sec-Fetch-User"] = "?1";
    proxyOpts.headers["Upgrade-Insecure-Requests"] = "1";
    proxyOpts.headers["Connection"] = "keep-alive";
    return fetch(proxyUrl, __spreadProps(__spreadValues({}, proxyOpts), { redirect: "manual" })).then(function(r) {
      if (r.ok || r.status >= 300 && r.status < 400) return r;
      return fetch(curUrl, __spreadProps(__spreadValues({}, fetchOpts), { redirect: "manual" }));
    }).catch(function() {
      return fetch(curUrl, __spreadProps(__spreadValues({}, fetchOpts), { redirect: "manual" }));
    });
  }
  return fetch(curUrl, __spreadProps(__spreadValues({}, fetchOpts), { redirect: "manual" }));
}
function _follow(url, options, maxHops, jar) {
  return new Promise(function(resolve, reject) {
    var hops = 0;
    function doFetch(curUrl) {
      if (hops++ > maxHops) return reject(new Error("Too many redirects"));
      var fetchOpts = {};
      for (var k in options) fetchOpts[k] = options[k];
      var cookieStr = _jarGet(curUrl, jar);
      if (cookieStr) {
        fetchOpts.headers = fetchOpts.headers || {};
        fetchOpts.headers["Cookie"] = cookieStr;
      }
      var fetchTimeoutMs = fetchOpts.timeout || 15e3;
      var fetchTimer = setTimeout(function() {
        reject(new Error("Follow fetch timeout " + fetchTimeoutMs + "ms"));
      }, fetchTimeoutMs);
      _fetchDirectOrProxy(curUrl, fetchOpts).then(function(r) {
        clearTimeout(fetchTimer);
        var finalUrl = curUrl;
        _extractCookies(r, finalUrl, jar);
        if (r.status >= 300 && r.status < 400 && r.status !== 304) {
          var loc = r.headers.get("location");
          if (loc) {
            var nextUrl = loc.indexOf("://") >= 0 ? loc : _resolveUrl(loc, finalUrl);
            if (nextUrl && nextUrl !== curUrl) return doFetch(nextUrl);
          }
        }
        return r.text().then(function(text) {
          resolve({ ok: true, status: r.status, text, url: finalUrl });
        });
      }).catch(function(err) {
        clearTimeout(fetchTimer);
        reject(err);
      });
    }
    doFetch(url);
  });
}
function _clickaFetch(url, referer, jar) {
  var headers = {
    "User-Agent": ES_UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept-Encoding": "identity"
  };
  if (referer) headers["Referer"] = referer;
  return _follow(url, { headers }, 7, jar);
}
function _clickaPost(url, formData, referer, jar) {
  var headers = {
    "User-Agent": ES_UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
    "Content-Type": "application/x-www-form-urlencoded"
  };
  try {
    headers["Origin"] = new URL(url).origin;
  } catch (e) {
  }
  if (referer) headers["Referer"] = referer;
  var body = typeof formData === "string" ? formData : _formEncode(formData);
  return _follow(url, { method: "POST", headers, body }, 7, jar);
}
function _formEncode(obj) {
  var parts = [];
  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(obj[k])));
    }
  }
  return parts.join("&");
}
var _zlib = null;
try {
  _zlib = require("zlib");
} catch (e) {
}
function _pngDecode(b64) {
  if (!_zlib) throw new Error("zlib not available");
  var raw = typeof atob !== "undefined" ? atob(b64) : require("buffer").Buffer.from(b64, "base64").toString("latin1");
  var len = raw.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) bytes[i] = raw.charCodeAt(i) & 255;
  if (bytes[0] !== 137 || bytes[1] !== 80 || bytes[2] !== 78 || bytes[3] !== 71) {
    throw new Error("Not a PNG");
  }
  var pos = 8;
  var width, height, bitDepth, colorType;
  var idatData = [];
  while (pos + 8 <= bytes.length) {
    var clen = bytes[pos] << 24 | bytes[pos + 1] << 16 | bytes[pos + 2] << 8 | bytes[pos + 3];
    var ctype = String.fromCharCode(bytes[pos + 4]) + String.fromCharCode(bytes[pos + 5]) + String.fromCharCode(bytes[pos + 6]) + String.fromCharCode(bytes[pos + 7]);
    if (ctype === "IHDR") {
      width = bytes[pos + 8] << 24 | bytes[pos + 9] << 16 | bytes[pos + 10] << 8 | bytes[pos + 11];
      height = bytes[pos + 12] << 24 | bytes[pos + 13] << 16 | bytes[pos + 14] << 8 | bytes[pos + 15];
      bitDepth = bytes[pos + 16];
      colorType = bytes[pos + 17];
    } else if (ctype === "IDAT") {
      var chunkData = bytes.subarray(pos + 8, pos + 8 + clen);
      idatData.push(chunkData);
    } else if (ctype === "IEND") {
      break;
    }
    pos += 12 + clen;
  }
  if (!width || !height) throw new Error("PNG: no IHDR");
  var bytesPerPixel = colorType === 6 ? 4 : colorType === 2 ? 3 : 1;
  if (bitDepth !== 8 || colorType !== 2 && colorType !== 6) {
    throw new Error("PNG: unsupported format colorType=" + colorType + " bitDepth=" + bitDepth);
  }
  var totalLen = 0;
  for (var di = 0; di < idatData.length; di++) totalLen += idatData[di].length;
  var idatCombined = new Uint8Array(totalLen);
  var off = 0;
  for (var di2 = 0; di2 < idatData.length; di2++) {
    idatCombined.set(idatData[di2], off);
    off += idatData[di2].length;
  }
  var decompressed = _zlib.inflateSync(idatCombined);
  var bpp = bytesPerPixel;
  var rowBytes = width * bpp;
  var pixels = new Array(height);
  var dpos = 0;
  for (var y = 0; y < height; y++) {
    var filter = decompressed[dpos++];
    var row = new Uint8Array(rowBytes);
    var prevRow = y > 0 ? pixels[y - 1] : null;
    for (var x = 0; x < rowBytes; x++) {
      var rawByte = decompressed[dpos++];
      if (filter === 0) {
        row[x] = rawByte;
      } else if (filter === 1) {
        var left = x >= bpp ? row[x - bpp] : 0;
        row[x] = rawByte + left & 255;
      } else if (filter === 2) {
        var up = prevRow ? prevRow[x] : 0;
        row[x] = rawByte + up & 255;
      } else if (filter === 3) {
        var leftA = x >= bpp ? row[x - bpp] : 0;
        var upA = prevRow ? prevRow[x] : 0;
        row[x] = rawByte + Math.floor((leftA + upA) / 2) & 255;
      } else if (filter === 4) {
        var leftP = x >= bpp ? row[x - bpp] : 0;
        var upP = prevRow ? prevRow[x] : 0;
        var upLeftP = x >= bpp && prevRow ? prevRow[x - bpp] : 0;
        var p = leftP + upP - upLeftP;
        var pa = Math.abs(p - leftP);
        var pb = Math.abs(p - upP);
        var pc = Math.abs(p - upLeftP);
        var pr = pa <= pb && pa <= pc ? leftP : pb <= pc ? upP : upLeftP;
        row[x] = rawByte + pr & 255;
      }
    }
    pixels[y] = row;
  }
  return { width, height, pixels, bpp };
}
var DIGIT_PIXELS = [
  // 0 (w=8)
  {
    w: 8,
    pixels: [
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0]
    ]
  },
  // 1 (w=3)
  {
    w: 3,
    pixels: [
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
      [0, 1, 1],
      [0, 1, 1],
      [0, 1, 1],
      [0, 1, 1],
      [0, 1, 1],
      [0, 1, 1],
      [1, 1, 1]
    ]
  },
  // 2 (w=7)
  {
    w: 7,
    pixels: [
      [0, 1, 1, 1, 1, 0, 0],
      [1, 1, 0, 0, 1, 1, 0],
      [1, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 1, 1, 0],
      [0, 0, 0, 1, 1, 0, 0],
      [0, 0, 1, 1, 0, 0, 0],
      [0, 1, 1, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1]
    ]
  },
  // 3 (w=5)
  {
    w: 5,
    pixels: [
      [1, 1, 1, 0, 0],
      [0, 0, 1, 1, 0],
      [0, 0, 0, 1, 1],
      [0, 0, 1, 1, 0],
      [1, 1, 1, 0, 0],
      [0, 0, 1, 1, 0],
      [0, 0, 0, 1, 1],
      [0, 0, 0, 1, 1],
      [0, 0, 1, 1, 0],
      [1, 1, 1, 0, 0]
    ]
  },
  // 4 (w=6)
  {
    w: 6,
    pixels: [
      [0, 0, 0, 0, 1, 1],
      [0, 0, 0, 1, 1, 1],
      [0, 0, 1, 1, 1, 1],
      [0, 1, 1, 0, 1, 1],
      [1, 1, 0, 0, 1, 1],
      [1, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 1, 1]
    ]
  },
  // 5 (w=8)
  {
    w: 8,
    pixels: [
      [1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 1, 0, 0],
      [1, 1, 1, 0, 0, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0]
    ]
  },
  // 6 (w=7)
  {
    w: 7,
    pixels: [
      [0, 0, 1, 1, 1, 1, 0],
      [0, 1, 1, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 1, 0],
      [1, 1, 1, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1],
      [1, 1, 0, 0, 0, 0, 1],
      [0, 1, 1, 0, 0, 1, 1],
      [0, 0, 1, 1, 1, 1, 0]
    ]
  },
  // 7 (w=8)
  {
    w: 8,
    pixels: [
      [1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 1, 1, 0],
      [0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0],
      [0, 1, 1, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 0, 0, 0, 0, 0]
    ]
  },
  // 8 (w=8)
  {
    w: 8,
    pixels: [
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 0, 0, 1, 1],
      [0, 1, 1, 0, 0, 1, 1, 0],
      [0, 0, 1, 1, 1, 1, 0, 0]
    ]
  },
  // 9 (w=7)
  {
    w: 7,
    pixels: [
      [0, 1, 1, 1, 1, 0, 0],
      [1, 1, 0, 0, 1, 1, 0],
      [1, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 1, 1, 1],
      [0, 1, 1, 1, 0, 1, 1],
      [0, 0, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 0, 1, 1],
      [1, 1, 0, 0, 1, 1, 0],
      [0, 1, 1, 1, 1, 0, 0]
    ]
  }
];
function _binarize(pixels, w, h, bpp) {
  var bin = new Array(h);
  for (var y = 0; y < h; y++) {
    bin[y] = new Uint8Array(w);
    for (var x = 0; x < w; x++) {
      var idx = x * bpp;
      var r = pixels[y][idx];
      var g = pixels[y][idx + 1];
      var b = pixels[y][idx + 2];
      var mx = Math.max(r, g, b);
      var mn = Math.min(r, g, b);
      bin[y][x] = r < 110 && g < 110 && b < 170 && mx - mn < 80 ? 1 : 0;
    }
  }
  return bin;
}
function _segmentChars(bin, w, h) {
  var proj = new Array(w);
  for (var x = 0; x < w; x++) {
    var count = 0;
    for (var y = 0; y < h; y++) {
      if (bin[y][x]) count++;
    }
    proj[x] = count;
  }
  var threshold = Math.round(h * 0.1);
  var segments = [];
  var inChar = false;
  var start = 0;
  for (var x2 = 0; x2 < w; x2++) {
    if (proj[x2] >= threshold) {
      if (!inChar) {
        start = x2;
        inChar = true;
      }
    } else {
      if (inChar) {
        if (x2 - start >= 2) segments.push({ x1: start, x2: x2 - 1 });
        inChar = false;
      }
    }
  }
  if (inChar && w - start >= 2) segments.push({ x1: start, x2: w - 1 });
  var refined = [];
  for (var si = 0; si < segments.length; si++) {
    var seg = segments[si];
    var segW = seg.x2 - seg.x1 + 1;
    if (segW >= 2 && segW <= w * 0.5) refined.push(seg);
  }
  return refined;
}
function _extractSegment(bin, seg, w, h) {
  var segW = seg.x2 - seg.x1 + 1;
  var data = new Array(h);
  for (var y = 0; y < h; y++) {
    data[y] = new Uint8Array(segW);
    for (var x = 0; x < segW; x++) {
      data[y][x] = bin[y][seg.x1 + x];
    }
  }
  return { data, w: segW, h };
}
function _cropSegVert(segData, segW, segH) {
  var y1 = segH, y2 = 0;
  for (var y = 0; y < segH; y++) {
    for (var x = 0; x < segW; x++) {
      if (segData[y][x]) {
        if (y < y1) y1 = y;
        if (y > y2) y2 = y;
        break;
      }
    }
  }
  if (y2 < y1) return null;
  var cropH = y2 - y1 + 1;
  var cropped = new Array(cropH);
  for (var y = y1; y <= y2; y++) {
    cropped[y - y1] = new Uint8Array(segW);
    for (var x = 0; x < segW; x++) cropped[y - y1][x] = segData[y][x];
  }
  return { data: cropped, w: segW, h: cropH };
}
function _digitMatchScore(segData, segW, segH, template) {
  var tw = template.w;
  var th = 10;
  if (segH !== th) return 0;
  var sw = segW < tw ? segW : tw;
  var lw = segW < tw ? tw : segW;
  var shortData = segW < tw ? segData : template.pixels;
  var longData = segW < tw ? template.pixels : segData;
  var maxScore = 0;
  for (var off = 0; off <= lw - sw; off++) {
    var matches = 0;
    for (var y = 0; y < th; y++) {
      for (var x = 0; x < sw; x++) {
        if (shortData[y][x] === longData[y][off + x]) matches++;
      }
    }
    var score = matches / (sw * th);
    if (score > maxScore) maxScore = score;
  }
  return maxScore;
}
function _classifyDigit(segData, segW, segH) {
  if (segH <= 0) return -1;
  var cropped = _cropSegVert(segData, segW, segH);
  if (!cropped || cropped.h < 8) return -1;
  var cw = cropped.w, ch = cropped.h;
  var bestScore = 0;
  var bestDigit = -1;
  for (var d = 0; d < 10; d++) {
    var tmpl = DIGIT_PIXELS[d];
    if (Math.abs(cw - tmpl.w) > 2) continue;
    var score = _digitMatchScore(cropped.data, cw, ch, tmpl);
    if (score > bestScore) {
      bestScore = score;
      bestDigit = d;
    }
  }
  if (bestScore >= 0.75) return bestDigit;
  for (var d2 = 0; d2 < 10; d2++) {
    var tmpl2 = DIGIT_PIXELS[d2];
    if (Math.abs(cw - tmpl2.w) > 3) continue;
    var score2 = _digitMatchScore(cropped.data, cw, ch, tmpl2);
    if (score2 > bestScore) {
      bestScore = score2;
      bestDigit = d2;
    }
  }
  return bestScore >= 0.6 ? bestDigit : -1;
}
function _ocrSolve(imageB64) {
  var decoded = _pngDecode(imageB64);
  var bin = _binarize(decoded.pixels, decoded.width, decoded.height, decoded.bpp);
  var segs = _segmentChars(bin, decoded.width, decoded.height);
  if (segs.length < 3 || segs.length > 6) return null;
  var result = "";
  for (var si = 0; si < segs.length; si++) {
    var seg = _extractSegment(bin, segs[si], decoded.width, decoded.height);
    var digit = _classifyDigit(seg.data, seg.w, seg.h);
    if (digit < 0) return null;
    result += String(digit);
  }
  return result;
}
function _hasCaptcha(text) {
  var hasImg = /data:image\/(?:png|jpe?g);base64,/i.test(text);
  if (!hasImg) return false;
  if (/maxstream\.video\/uprots/i.test(text)) return false;
  var hasForm = /<input[^>]+\bname=["']?capt(?:cha|ch5|ch6)?["']?/i.test(text);
  return hasForm;
}
function _captchaImageSrc(text) {
  var m = text.match(/data:image\/(?:png|jpe?g);base64,[^"]+/i);
  return m ? m[0] : null;
}
function _formDataFromInputs(text, guess, captchaField) {
  var data = {};
  var inputRe = /<input\b[^>]*>/gi;
  var m;
  while (m = inputRe.exec(text)) {
    var tag = m[0];
    var nameM = tag.match(/\bname=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    if (!nameM) continue;
    var name = _decodeEntities(nameM[1] || nameM[2] || nameM[3] || "");
    var valueM = tag.match(/\bvalue=(?:"([^"]*)"|'([^']*)'|([^\s>]*))/i);
    var value = valueM ? _decodeEntities(valueM[1] || valueM[2] || valueM[3] || "") : "";
    var lowerName = name.toLowerCase();
    var isCaptcha = lowerName.indexOf("capt") === 0 || /captcha|insert\s+numbers/i.test(tag);
    if (name && isCaptcha) {
      data[name] = guess;
    } else if (name) {
      data[name] = value;
    }
  }
  return data;
}
function _findCaptchaFormAction(text, baseUrl) {
  var formRe = /<form\b[^>]*>/gi;
  var m;
  while (m = formRe.exec(text)) {
    if (m[0].toLowerCase().indexOf("data:image") >= 0 || /name=["']?capt(?:cha|ch5|ch6)?["']?/i.test(m[0])) {
      var actionM = m[0].match(/\baction=(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i);
      if (actionM) {
        var action = _decodeEntities(actionM[1] || actionM[2] || actionM[3] || "").trim();
        if (action) return _resolveUrl(action, baseUrl);
      }
      return baseUrl;
    }
  }
  return baseUrl;
}
function _findProceedToVideoUrl(text) {
  var m = text.match(/https?:\/\/clicka\.cc\/(?:adelta|tva|amix)\/[^"'<>\s]+/i);
  if (m) return m[0];
  var dm = text.match(new RegExp(`https?://[^\\s"'>]*` + MD_PAT + `[^\\s"'>]+`, "i"));
  if (dm) return dm[0];
  var dt = text.match(/https?:\/\/[^\s"'>]*?deltabit\.[a-z]+\/[A-Za-z0-9]{6,}/i);
  if (dt) return dt[0];
  var tv = text.match(/https?:\/\/[^\s"'>]*?turbovid\.[a-z]+\/[A-Za-z0-9]{6,}/i);
  if (tv) return tv[0];
  var aM = text.match(/<a\b[^>]*href=["']([^"']+)["'][^>]*>[\s\S]*?Proceed\s*to\s*video/i);
  return aM ? aM[1] : null;
}
function _findMixdropUrl(text) {
  var re = new RegExp(`https?://[^\\s"'>]*` + MD_PAT + `[^\\s"'>]*/(?:e|f|emb|embed)/([A-Za-z0-9]+)`, "i");
  var m = text.match(re);
  return m ? { url: m[0], id: m[1] } : null;
}
function _findNextUprotUrl(text, baseUrl) {
  var anchors = text.match(/<a\b[^>]*\bhref=(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>([\s\S]*?)<\/a>/gi);
  if (!anchors) return null;
  for (var ai = 0; ai < anchors.length; ai++) {
    var aTag = anchors[ai];
    var hrefM = aTag.match(/\bhref=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    var labelM = aTag.match(/>([\s\S]*?)<\/a>/i);
    var href = hrefM ? hrefM[1] || hrefM[2] || hrefM[3] : null;
    var label = labelM ? labelM[1].replace(/<[^>]+>/g, "").toLowerCase().trim() : "";
    if (href && label.indexOf("continue") >= 0 && /(maxstream|clicka|uprots|adelta)/i.test(href)) {
      var resolved = _resolveUrl(href, baseUrl);
      if (resolved) return resolved;
    }
  }
  for (var ai2 = 0; ai2 < anchors.length; ai2++) {
    var aTag2 = anchors[ai2];
    var hrefM2 = aTag2.match(/\bhref=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
    var labelM2 = aTag2.match(/>([\s\S]*?)<\/a>/i);
    var href2 = hrefM2 ? hrefM2[1] || hrefM2[2] || hrefM2[3] : null;
    var label2 = labelM2 ? labelM2[1].replace(/<[^>]+>/g, "").toLowerCase().trim() : "";
    if (href2 && label2.indexOf("continue") >= 0) {
      var resolved2 = _resolveUrl(href2, baseUrl);
      if (resolved2) return resolved2;
    }
  }
  return null;
}
function _findM3u8(text) {
  var pats = [
    /sources:\s*\[\s*\{\s*src:\s*["']([^"']+\.m3u8[^"']*)["']/i,
    /(?:file|src|url)\s*[:=]\s*["']([^"']+\.m3u8[^"']*)["']/i,
    /["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/i,
    /(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/i
  ];
  for (var pi = 0; pi < pats.length; pi++) {
    var mm = text.match(pats[pi]);
    if (mm && mm[1]) return mm[1].replace(/\\/g, "");
  }
  return null;
}
function _findStreamSource(text) {
  var pats = [
    /sources\s*:\s*\[\s*["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i,
    /sources\s*:\s*\[\s*\{\s*(?:file|src|url)\s*:\s*["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/i,
    /(?:file|src|url)\s*[:=]\s*["'](https?:\/\/[^"']+\.(?:mp4|m3u8)[^"']*)["']/i,
    /["'](https?:\/\/[^"']+\.(?:mp4|m3u8)[^"']*)["']/i
  ];
  for (var pi = 0; pi < pats.length; pi++) {
    var mm = text.match(pats[pi]);
    if (mm && mm[1]) return mm[1].replace(/\\\//g, "/").replace(/\\/g, "");
  }
  return null;
}
function _isDeltabitHost(url) {
  try {
    return /(^|\.)deltabit\./.test(new URL(url).host);
  } catch (e) {
    return false;
  }
}
function _isTurbovidHost(url) {
  try {
    var h = new URL(url).host.toLowerCase();
    return /(turbovid)/.test(h);
  } catch (e) {
    return false;
  }
}
function _isMixdropHost(url) {
  try {
    var h = new URL(url).host.toLowerCase();
    return new RegExp(MD_PAT).test(h);
  } catch (e) {
    return false;
  }
}
function unpackPackedJs(packed) {
  var m = packed.match(/eval\(function\(p,a,c,k,e,d\)\{[\s\S]*?\}\(\s*'((?:\\.|[^'\\])*)'\s*,\s*(\d+|\[\])\s*,\s*(\d+)\s*,\s*'((?:\\.|[^'\\])*)'\s*\.split\(['"]\|['"]\)/);
  if (!m) {
    m = packed.match(/\}\(\s*'((?:\\.|[^'\\])*)'\s*,\s*(\d+|\[\])\s*,\s*(\d+)\s*,\s*'((?:\\.|[^'\\])*)'\s*\.split\(['"]\|['"]\)/);
  }
  if (!m) return null;
  var p = m[1].replace(/\\'/g, "'").replace(/\\\\/g, "\\");
  var a = m[2] === "[]" ? 62 : parseInt(m[2], 10);
  var c = parseInt(m[3], 10);
  var k = m[4].split("|");
  var ALPHA = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  function toBaseN(n) {
    if (n < a) return ALPHA[n];
    return toBaseN(Math.floor(n / a)) + ALPHA[n % a];
  }
  var dict = {};
  for (var i = 0; i < c; i++) {
    var key = toBaseN(i);
    dict[key] = k[i] && k[i].length ? k[i] : key;
  }
  return p.replace(/\b(\w+)\b/g, function(_, w) {
    return dict[w] !== void 0 ? dict[w] : w;
  });
}
function _solveCaptchaPage(text, currentUrl, jar) {
  return new Promise(function(resolve, reject) {
    if (!_hasCaptcha(text)) return resolve({ text, url: currentUrl });
    var imageSrc = _captchaImageSrc(text);
    if (!imageSrc) return reject(new Error("captcha image not found"));
    var b64 = imageSrc.replace(/^data:image\/(?:png|jpe?g);base64,/, "");
    var guess = _ocrSolve(b64);
    if (!guess || guess.length < 3 || guess.length > 6) {
      return reject(new Error("OCR failed to solve captcha"));
    }
    var action = _findCaptchaFormAction(text, currentUrl);
    var formData = _formDataFromInputs(text, guess);
    _clickaPost(action, formData, currentUrl, jar).then(function(postRes) {
      if (_hasCaptcha(postRes.text)) {
        var _pv = _findProceedToVideoUrl(postRes.text);
        if (!_pv) {
          return reject(new Error("captcha still present after POST"));
        }
      }
      resolve({ text: postRes.text, url: action });
    }).catch(function(err) {
      reject(err);
    });
  });
}
function fetchMixDrop(host, id) {
  return new Promise(function(resolve, reject) {
    var headers = {
      "User-Agent": ES_UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
      "Accept-Encoding": "identity",
      "Referer": "https://" + host + "/"
    };
    var url = "https://" + host + "/e/" + id;
    fetch(url, { headers, timeout: 15e3 }).then(function(r) {
      return r.text();
    }).then(function(html) {
      var combined = html;
      var packerRe = /eval\(function\(p,a,c,k,e,d\)[\s\S]*?\}\([\s\S]*?\.split\(['"]\|['"]\)[\s\S]*?\)\s*\)/g;
      var pm;
      while ((pm = packerRe.exec(html)) !== null) {
        var unpacked = unpackPackedJs(pm[0]);
        if (unpacked) combined += "\n" + unpacked;
      }
      var streamUrl = _findStreamSource(combined);
      if (!streamUrl) {
        var mdPats = [
          /(?:MDCore|vsConfig)\.wurl\s*=\s*["']([^"']+)["']/,
          /wurl\s*[:=]\s*["']([^"']+)["']/,
          /<source\s+[^>]*src=["']([^"']+)["']/i,
          /file\s*:\s*["']([^"']+\.(?:mp4|m3u8)[^"']*)["']/
        ];
        for (var pi = 0; pi < mdPats.length; pi++) {
          var mm = combined.match(mdPats[pi]);
          if (mm && mm[1]) {
            streamUrl = mm[1].trim();
            if (streamUrl.indexOf("//") === 0) streamUrl = "https:" + streamUrl;
            break;
          }
        }
      }
      if (!streamUrl) return reject(new Error("MixDrop stream URL not found for " + host + "/" + id));
      resolve(streamUrl);
    }).catch(function(err) {
      reject(err);
    });
  });
}
function tryMixDropHosts(id) {
  var idx = 0;
  var lastErr = null;
  function next() {
    if (idx >= MD_HOSTS.length) {
      return Promise.reject(new Error("MixDrop all hosts failed: " + (lastErr || "unknown")));
    }
    var host = MD_HOSTS[idx++];
    return fetchMixDrop(host, id).then(function(streamUrl) {
      return { url: streamUrl, host };
    }).catch(function(err) {
      lastErr = err.message;
      return next();
    });
  }
  return next();
}
function extractTurbovid(pageUrl, jar) {
  function _fetchWithTimeout(url, options, ms) {
    return Promise.race([
      fetch(url, options),
      new Promise(function(_, reject) {
        setTimeout(function() {
          reject(new Error("Fetch timeout " + ms + "ms"));
        }, ms);
      })
    ]);
  }
  return new Promise(function(resolve, reject) {
    var landingHeaders = {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.8,it;q=0.7",
      "Accept-Encoding": "identity",
      "Referer": "https://safego.cc/"
    };
    var cookieStr = _jarGet(pageUrl, jar);
    if (cookieStr) landingHeaders["Cookie"] = cookieStr;
    _fetchWithTimeout(pageUrl, { headers: landingHeaders, redirect: "manual" }, 15e3).then(function(r) {
      try {
        if (r.headers && r.headers.get) {
          var sc = r.headers.get("set-cookie") || r.headers.get("Set-Cookie");
          if (sc) _jarSet(pageUrl, sc, jar);
        }
      } catch (e) {
      }
      return r.text();
    }).then(function(html) {
      var finalOrigin = (function() {
        try {
          return new URL(pageUrl).origin;
        } catch (e) {
          return "";
        }
      })();
      var source = _findStreamSource(html);
      if (source) return resolve({ url: source, headers: { "User-Agent": landingHeaders["User-Agent"], "Referer": pageUrl, "Origin": finalOrigin } });
      var formData = {};
      var ir = /<input\b[^>]*>/gi;
      var im;
      while (im = ir.exec(html)) {
        var tag = im[0];
        var nameM = tag.match(/\bname=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
        if (!nameM) continue;
        var name = _decodeEntities(nameM[1] || nameM[2] || nameM[3] || "");
        var valueM = tag.match(/\bvalue=(?:"([^"]*)"|'([^']*)'|([^\s>]*))/i);
        var value = valueM ? _decodeEntities(valueM[1] || valueM[2] || valueM[3] || "") : "";
        if (name) formData[name] = value;
      }
      if (!formData.op) {
        return reject(new Error("Turbovid: form op not found"));
      }
      formData.imhuman = "Proceed+to+video";
      formData.referer = pageUrl;
      var postHeaders = {
        "User-Agent": landingHeaders["User-Agent"],
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.8,it;q=0.7",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": finalOrigin,
        "Referer": pageUrl
      };
      var cookieStr2 = _jarGet(pageUrl, jar);
      if (cookieStr2) postHeaders["Cookie"] = cookieStr2;
      return _sleep(5e3).then(function() {
        return _fetchWithTimeout(pageUrl, { method: "POST", headers: postHeaders, body: _formEncode(formData), redirect: "manual" }, 3e4);
      });
    }).then(function(r) {
      try {
        if (r.headers && r.headers.get) {
          var sc = r.headers.get("set-cookie") || r.headers.get("Set-Cookie");
          if (sc) _jarSet(pageUrl, sc, jar);
        }
      } catch (e) {
      }
      return r.text();
    }).then(function(html) {
      var finalOrigin = (function() {
        try {
          return new URL(pageUrl).origin;
        } catch (e) {
          return "";
        }
      })();
      var source = _findStreamSource(html);
      if (!source) {
        var combined = html;
        var packerRe = /eval\(function\(p,a,c,k,e,d\)[\s\S]*?\}\([\s\S]*?\.split\(['"]\|['"]\)[\s\S]*?\)\s*\)/g;
        var pm;
        while ((pm = packerRe.exec(html)) !== null) {
          var unpacked = unpackPackedJs(pm[0]);
          if (unpacked) {
            combined += "\n" + unpacked;
          }
        }
        source = _findStreamSource(combined);
      }
      if (!source) {
        var retryHeaders = {
          "User-Agent": landingHeaders["User-Agent"],
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.8,it;q=0.7",
          "Accept-Encoding": "identity",
          "Referer": "https://safego.cc/"
        };
        var cstr = _jarGet(pageUrl, jar);
        if (cstr) retryHeaders["Cookie"] = cstr;
        return _fetchWithTimeout(pageUrl, { headers: retryHeaders, redirect: "manual" }, 15e3).then(function(r2) {
          return r2.text();
        }).then(function(html2) {
          source = _findStreamSource(html2);
          if (!source) return reject(new Error("Turbovid: stream source not found"));
          resolve({ url: source, headers: { "User-Agent": landingHeaders["User-Agent"], "Referer": pageUrl, "Origin": finalOrigin } });
        });
      }
      resolve({ url: source, headers: { "User-Agent": landingHeaders["User-Agent"], "Referer": pageUrl, "Origin": finalOrigin } });
    }).catch(function(err) {
      reject(err);
    });
  });
}
function extractDeltabit(pageUrl, jar) {
  return new Promise(function(resolve, reject) {
    var landingHeaders = {
      "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.8,it;q=0.7",
      "Accept-Encoding": "identity",
      "Referer": "https://safego.cc/"
    };
    var cookieStr = _jarGet(pageUrl, jar);
    if (cookieStr) landingHeaders["Cookie"] = cookieStr;
    fetch(pageUrl, { headers: landingHeaders, timeout: 15e3 }).then(function(r) {
      try {
        if (r.headers && r.headers.get) {
          var sc = r.headers.get("set-cookie") || r.headers.get("Set-Cookie");
          if (sc) _jarSet(pageUrl, sc, jar);
        }
      } catch (e) {
      }
      return r.text();
    }).then(function(html) {
      var finalOrigin = (function() {
        try {
          return new URL(pageUrl).origin;
        } catch (e) {
          return "";
        }
      })();
      var source = _findStreamSource(html);
      if (source) return resolve({ url: source, headers: { "User-Agent": landingHeaders["User-Agent"], "Referer": pageUrl, "Origin": finalOrigin } });
      var formData = {};
      var ir = /<input\b[^>]*>/gi;
      var im;
      while (im = ir.exec(html)) {
        var tag = im[0];
        var nameM = tag.match(/\bname=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
        if (!nameM) continue;
        var name = _decodeEntities(nameM[1] || nameM[2] || nameM[3] || "");
        var valueM = tag.match(/\bvalue=(?:"([^"]*)"|'([^']*)'|([^\s>]*))/i);
        var value = valueM ? _decodeEntities(valueM[1] || valueM[2] || valueM[3] || "") : "";
        if (name) formData[name] = value;
      }
      if (!formData.op) return reject(new Error("Deltabit: form op not found"));
      formData.imhuman = "";
      formData.referer = pageUrl;
      var postHeaders = {
        "User-Agent": landingHeaders["User-Agent"],
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.8,it;q=0.7",
        "Content-Type": "application/x-www-form-urlencoded",
        "Origin": finalOrigin,
        "Referer": pageUrl
      };
      var cookieStr2 = _jarGet(pageUrl, jar);
      if (cookieStr2) postHeaders["Cookie"] = cookieStr2;
      return _sleep(2500).then(function() {
        return fetch(pageUrl, { method: "POST", headers: postHeaders, body: _formEncode(formData), timeout: 3e4 });
      });
    }).then(function(r) {
      try {
        if (r.headers && r.headers.get) {
          var sc = r.headers.get("set-cookie") || r.headers.get("Set-Cookie");
          if (sc) _jarSet(pageUrl, sc, jar);
        }
      } catch (e) {
      }
      return r.text();
    }).then(function(html) {
      var finalOrigin = (function() {
        try {
          return new URL(pageUrl).origin;
        } catch (e) {
          return "";
        }
      })();
      var source = _findStreamSource(html);
      if (!source) {
        var combined = html;
        var packerRe = /eval\(function\(p,a,c,k,e,d\)[\s\S]*?\}\([\s\S]*?\.split\(['"]\|['"]\)[\s\S]*?\)\s*\)/g;
        var pm;
        while ((pm = packerRe.exec(html)) !== null) {
          var unpacked = unpackPackedJs(pm[0]);
          if (unpacked) combined += "\n" + unpacked;
        }
        source = _findStreamSource(combined);
      }
      if (!source) {
        var retryHeaders = {
          "User-Agent": landingHeaders["User-Agent"],
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.8,it;q=0.7",
          "Accept-Encoding": "identity",
          "Referer": "https://safego.cc/"
        };
        var cstr = _jarGet(pageUrl, jar);
        if (cstr) retryHeaders["Cookie"] = cstr;
        return fetch(pageUrl, { headers: retryHeaders, timeout: 15e3 }).then(function(r2) {
          return r2.text();
        }).then(function(html2) {
          source = _findStreamSource(html2);
          if (!source) return reject(new Error("Deltabit: stream source not found"));
          resolve({ url: source, headers: { "User-Agent": landingHeaders["User-Agent"], "Referer": pageUrl, "Origin": finalOrigin } });
        });
      }
      resolve({ url: source, headers: { "User-Agent": landingHeaders["User-Agent"], "Referer": pageUrl, "Origin": finalOrigin } });
    }).catch(function(err) {
      reject(err);
    });
  });
}
function _followRedirector(url, referer, jar) {
  return _clickaFetch(url, referer, jar).then(function(res) {
    var text = res.text;
    var metaM = text.match(/<meta[^>]+http-equiv=["']?refresh["']?[^>]+url=["']?([^"'>\s]+)/i);
    if (metaM) {
      var upUrl = _resolveUrl(metaM[1], url);
      if (upUrl) return upUrl;
    }
    var canM = text.match(/<link[^>]+rel=["']?canonical["']?[^>]+href=["']([^"']+)["']/i);
    if (canM) return canM[1];
    var formM = text.match(/<form[^>]+action=["']([^"']+)["']/i);
    if (formM && formM[1] && formM[1] !== "#") {
      var actionUrl = _resolveUrl(formM[1], res.url || url);
      if (actionUrl) return actionUrl;
    }
    var dlM = text.match(new RegExp(`https?://[^\\s"'>]*(?:deltabit|turbovid|` + MD_PAT + `)[^\\s"'>]*`, "i"));
    if (dlM) return dlM[0];
    return res.url || url;
  });
}
function resolveClickacc(startUrl, kind, jar) {
  var current = startUrl;
  var ES_DOMAIN = "https://eurostreamings.makeup";
  var referer = ES_DOMAIN + "/";
  var activeJar = jar || {};
  function loop(hop) {
    if (hop >= 6) return Promise.reject(new Error("Clickacc: max hops reached"));
    var isRedirector = false;
    try {
      var uPath = new URL(current).pathname;
      var uHost = new URL(current).host.toLowerCase();
      isRedirector = uHost === "clicka.cc" && /^\/(adelta|tva|amix)\//.test(uPath);
    } catch (e) {
    }
    if (isRedirector) {
      return _followRedirector(current, referer, activeJar).then(function(upUrl) {
        if (upUrl === current) return Promise.reject(new Error("Clickacc: redirector did not resolve"));
        referer = current;
        current = upUrl;
        return loop(hop + 1);
      });
    }
    if (kind === "mix" && _isMixdropHost(current)) {
      var mixMatch = current.match(/\/(?:e|f|emb|embed)\/([A-Za-z0-9]+)/i);
      if (mixMatch) {
        return tryMixDropHosts(mixMatch[1]).then(function(res) {
          return {
            url: _buildProxyUrl(res.url, "https://" + res.host + "/", ES_UA),
            name: "Eurostreaming",
            title: "MixDrop",
            behaviorHints: { notWebReady: true }
          };
        }).catch(function() {
          return Promise.reject(new Error("MixDrop extraction failed"));
        });
      }
    }
    if (kind === "tv" && _isTurbovidHost(current)) {
      return extractTurbovid(current, activeJar).then(function(video) {
        return {
          url: _buildProxyUrl(video.url, current, video.headers["User-Agent"], video.headers["Origin"]),
          name: "Eurostreaming",
          title: "Turbovid",
          behaviorHints: { notWebReady: true }
        };
      });
    }
    if (kind === "delta" && _isDeltabitHost(current)) {
      return extractDeltabit(current, activeJar).then(function(video) {
        return {
          url: _buildProxyUrl(video.url, current, video.headers["User-Agent"], video.headers["Origin"]),
          name: "Eurostreaming",
          title: "Deltabit",
          behaviorHints: { notWebReady: true }
        };
      });
    }
    return _clickaFetch(current, referer, activeJar).then(function(res) {
      var text = res.text;
      var finalUrl = res.url || current;
      if (_hasCaptcha(text)) {
        return _solveCaptchaPage(text, finalUrl, activeJar).then(function(solved) {
          text = solved.text;
          var proceedUrl = _findProceedToVideoUrl(text);
          if (proceedUrl && proceedUrl !== current) {
            referer = finalUrl;
            current = proceedUrl;
            return loop(hop + 1);
          }
          if (kind === "mix") {
            var md = _findMixdropUrl(text);
            if (md) return tryMixDropHosts(md.id).then(function(res2) {
              return {
                url: _buildProxyUrl(res2.url, "https://" + res2.host + "/", ES_UA),
                name: "Eurostreaming",
                title: "MixDrop",
                behaviorHints: { notWebReady: true }
              };
            });
          }
          var m3u8Url = _findM3u8(text);
          if (m3u8Url) return { url: m3u8Url, name: "Eurostreaming", title: "Stream", behaviorHints: { notWebReady: true } };
          var nextUrl = _findNextUprotUrl(text, finalUrl);
          if (!nextUrl || nextUrl === current) return Promise.reject(new Error("Clickacc: no next URL after captcha"));
          referer = finalUrl;
          current = nextUrl;
          return loop(hop + 1);
        });
      }
      var proceedUrl2 = _findProceedToVideoUrl(text);
      if (proceedUrl2 && proceedUrl2 !== current) {
        referer = finalUrl;
        current = proceedUrl2;
        return loop(hop + 1);
      }
      if (kind === "mix") {
        var md2 = _findMixdropUrl(text);
        if (md2) return tryMixDropHosts(md2.id).then(function(res2) {
          return {
            url: _buildProxyUrl(res2.url, "https://" + res2.host + "/", ES_UA),
            name: "Eurostreaming",
            title: "MixDrop",
            behaviorHints: { notWebReady: true }
          };
        });
      }
      var m3u8Url2 = _findM3u8(text);
      if (m3u8Url2) return { url: m3u8Url2, name: "Eurostreaming", title: "Stream", behaviorHints: { notWebReady: true } };
      var nextUrl2 = _findNextUprotUrl(text, finalUrl);
      if (!nextUrl2 || nextUrl2 === current) return Promise.reject(new Error("Clickacc: dead end"));
      referer = finalUrl;
      current = nextUrl2;
      return loop(hop + 1);
    });
  }
  return loop(0);
}
var TMDB_API_KEY = "68e094699525b18a70bab2f86b1fa706";
function _uniqueTitlesFromTmdbItem(item) {
  var titles = [];
  var seen = {};
  function add(value) {
    var title = String(value || "").trim();
    var key = title.toLowerCase();
    if (title && !seen[key]) {
      seen[key] = true;
      titles.push(title);
    }
  }
  if (item) {
    add(item.name);
    add(item.original_name);
  }
  return titles;
}
function _tmdbSeriesNames(id) {
  return new Promise(function(resolve) {
    var cleanId = String(id || "").replace(/^tmdb:/, "");
    if (/^tt\d+$/.test(cleanId)) {
      fetch("https://api.themoviedb.org/3/find/" + cleanId + "?api_key=" + TMDB_API_KEY + "&external_source=imdb_id&language=it-IT", { timeout: 1e4 }).then(function(r) {
        return r.ok ? r.json() : null;
      }).then(function(data) {
        if (data && data.tv_results && data.tv_results.length > 0) {
          resolve(_uniqueTitlesFromTmdbItem(data.tv_results[0]));
        } else {
          resolve([]);
        }
      }).catch(function() {
        resolve([]);
      });
    } else if (/^\d+$/.test(cleanId)) {
      fetch("https://api.themoviedb.org/3/tv/" + cleanId + "?api_key=" + TMDB_API_KEY + "&language=it-IT", { timeout: 1e4 }).then(function(r) {
        return r.ok ? r.json() : null;
      }).then(function(data) {
        resolve(_uniqueTitlesFromTmdbItem(data));
      }).catch(function() {
        resolve([]);
      });
    } else {
      resolve([]);
    }
  });
}
function getStreams(id, type, season, episode, providerContext) {
  return new Promise(function(resolve, reject) {
    var rawId = String(id || "").replace(/^tmdb:/, "");
    var mediaType = String(type || "movie").toLowerCase();
    if (mediaType !== "series" && mediaType !== "tv") return resolve([]);
    var seasonNum = Number(season) || 1;
    var episodeNum = Number(episode) || 1;
    var ctxTmdb = providerContext && /^\d+$/.test(String(providerContext.tmdbId || "")) ? String(providerContext.tmdbId) : null;
    var ctxImdb = providerContext && /^tt\d+$/i.test(String(providerContext.imdbId || "")) ? String(providerContext.imdbId) : null;
    var sandboxImdb = typeof __imdb_id !== "undefined" && __imdb_id ? String(__imdb_id) : null;
    var isImdb = function(s) {
      return /^tt\d+$/.test(String(s || ""));
    };
    var isNumeric = function(s) {
      return /^\d+$/.test(String(s || ""));
    };
    var imdbCandidate = null;
    var tmdbCandidate = null;
    if (isImdb(rawId)) {
      imdbCandidate = rawId;
    } else if (isNumeric(rawId)) {
      tmdbCandidate = rawId;
    }
    if (ctxImdb && isImdb(ctxImdb)) {
      imdbCandidate = ctxImdb;
    } else if (ctxTmdb && isNumeric(ctxTmdb) && !tmdbCandidate) {
      tmdbCandidate = ctxTmdb;
    }
    if (sandboxImdb && isImdb(sandboxImdb)) {
      imdbCandidate = sandboxImdb;
    } else if (sandboxImdb && isNumeric(sandboxImdb) && !tmdbCandidate) {
      tmdbCandidate = sandboxImdb;
    }
    function doSearch(title) {
      getEsDomain(function(domain) {
        if (!domain) return resolve([]);
        searchSeries(domain, title, seasonNum, function(pageUrl) {
          if (!pageUrl) return resolve([]);
          extractLinksFromPage(domain, pageUrl, seasonNum, episodeNum, function(streams) {
            resolve(_formatEurostreamingStreams(streams || [], seasonNum, episodeNum));
          });
        });
      });
    }
    function tryTitles(titles) {
      var list = Array.isArray(titles) ? titles.filter(Boolean) : [];
      var idx = 0;
      function next() {
        if (idx >= list.length) return resolve([]);
        getEsDomain(function(domain) {
          if (!domain) return resolve([]);
          searchSeries(domain, list[idx++], seasonNum, function(pageUrl) {
            if (!pageUrl) return next();
            extractLinksFromPage(domain, pageUrl, seasonNum, episodeNum, function(streams) {
              if (streams && streams.length > 0) return resolve(_formatEurostreamingStreams(streams, seasonNum, episodeNum));
              next();
            });
          });
        });
      }
      next();
    }
    function tryTmdbDirect() {
      if (tmdbCandidate) {
        _tmdbSeriesNames(tmdbCandidate).then(function(titles) {
          if (titles && titles.length > 0) return tryTitles(titles);
          resolve([]);
        }).catch(function() {
          resolve([]);
        });
      } else {
        resolve([]);
      }
    }
    if (imdbCandidate) {
      getCinemetaMeta("series", imdbCandidate, function(err, meta) {
        if (meta && meta.name) return doSearch(meta.name);
        _tmdbSeriesNames(imdbCandidate).then(function(titles) {
          if (titles && titles.length > 0) return tryTitles(titles);
          tryTmdbDirect();
        }).catch(function() {
          tryTmdbDirect();
        });
      });
    } else {
      tryTmdbDirect();
    }
  });
}
function getCinemetaMeta(type, imdbId, cb) {
  var url = "https://v3-cinemeta.strem.io/meta/" + type + "/" + imdbId + ".json";
  fetch(url, { timeout: 1e4 }).then(function(r) {
    return r.ok ? r.json() : null;
  }).then(function(data) {
    cb(null, data && data.meta ? data.meta : null);
  }).catch(function() {
    cb(null, null);
  });
}
function esFetch(url, cb) {
  var headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/146.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7",
    "Referer": "https://eurostreamings.makeup/"
  };
  fetch(url, { headers, timeout: 15e3 }).then(function(r) {
    return r.text();
  }).then(function(text) {
    cb(null, text);
  }).catch(function(err) {
    cb(err, null);
  });
}
function getEsDomain(cb) {
  fetch("https://raw.githubusercontent.com/cabod/domains/refs/heads/main/domains.json", { timeout: 1e4 }).then(function(r) {
    return r.text();
  }).then(function(data) {
    try {
      var json = JSON.parse(data);
      var d = json && json.eurostreaming;
      if (d && d.domain) return cb("https://" + d.domain);
      var ee = json && json["easter-egg"];
      if (ee && ee.eurostreaming && ee.eurostreaming.domain) return cb("https://" + ee.eurostreaming.domain);
    } catch (e) {
      var lines = data.split("\n");
      for (var i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("eurostreaming") >= 0) {
          var parts = lines[i].split("=");
          if (parts.length > 1 && parts[1].trim()) {
            var dom = parts[1].trim();
            if (!dom.startsWith("http")) dom = "https://" + dom;
            return cb(dom);
          }
        }
      }
    }
    tryFallbackDomains();
  }).catch(function() {
    tryFallbackDomains();
  });
  function tryFallbackDomains() {
    var fallbacks = ["eurostreamings.makeup", "eurostreaming.cfd", "eurostreaming.bond", "eurostreamings.xyz"];
    var fi = 0;
    function nextFb() {
      if (fi >= fallbacks.length) return cb(null);
      var dom = fallbacks[fi++];
      if (!dom.startsWith("http")) dom = "https://" + dom;
      fetch(dom + "/", { timeout: 5e3 }).then(function(r) {
        cb(r.ok ? dom : nextFb());
      }).catch(function() {
        nextFb();
      });
    }
    nextFb();
  }
}
function searchSeries(domain, title, seasonNum, cb) {
  var query = title;
  esFetch(domain + "/?s=" + encodeURIComponent(query), function(err, html) {
    if (err || !html) return cb(null);
    var entryPattern = /<li[^>]+id=["']post-(\d+)["'][^>]*class=["'][^"]*post[^"]*["'][^>]*>[\s\S]*?<h\d[^>]*>[\s\S]*?<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h\d>[\s\S]*?<\/li>/gi;
    var match;
    var candidates = [];
    var seen = {};
    var lowerTitle = title.toLowerCase();
    while ((match = entryPattern.exec(html)) !== null) {
      var href = match[2];
      var linkText = (match[3] || "").replace(/<[^>]+>/g, "").toLowerCase();
      if (!seen[href] && linkText.indexOf(lowerTitle) >= 0) {
        seen[href] = true;
        candidates.push(href);
      }
    }
    if (candidates.length === 0) {
      var allLinks = html.match(/<a[^>]+href=["']([^"']+)["'][^>]*title=["']([^"']+)["'][^>]*>/gi);
      if (allLinks) {
        allLinks.forEach(function(a) {
          var m = a.match(/href=["']([^"']+)["']/);
          var t = a.match(/title=["']([^"']+)["']/i);
          if (m && t && !seen[m[1]] && t[1].toLowerCase().indexOf(lowerTitle) >= 0) {
            seen[m[1]] = true;
            candidates.push(m[1]);
          }
        });
      }
    }
    cb(candidates.length > 0 ? candidates[0] : null);
  });
}
function extractLinksFromPage(domain, pageUrl, seasonNum, episodeNum, cb) {
  esFetch(pageUrl, function(err, html) {
    if (err || !html) return cb(null);
    var streams = [];
    var seen = {};
    var ep2 = episodeNum < 10 ? "0" + String(episodeNum) : String(episodeNum);
    var patterns = [
      seasonNum + "\\s*(?:&#215;|\xD7|x)\\s*0?" + episodeNum + "[\\s\\S]{0,8000}?(?=<br\\s*/?>|</div>)",
      "S0?" + seasonNum + "E" + ep2 + "[\\s\\S]{0,8000}?(?=<br\\s*/?>|</div>)"
    ];
    var block = null;
    for (var pi = 0; pi < patterns.length; pi++) {
      var m = html.match(new RegExp(patterns[pi], "i"));
      if (m) {
        block = m[0];
        break;
      }
    }
    if (!block) block = html;
    var clickaTasks = [];
    var clickaRe = /https?:\/\/clicka\.cc\/(tv|mix|delta)\/[A-Za-z0-9]+/gi;
    var cm;
    while ((cm = clickaRe.exec(block)) !== null) {
      if (!seen[cm[0]]) {
        seen[cm[0]] = true;
        clickaTasks.push({ url: cm[0], kind: cm[1] });
      }
    }
    if (clickaTasks.length === 0) return cb(streams.length > 0 ? streams : null);
    var resolved = false;
    var timer = setTimeout(function() {
      if (!resolved) {
        resolved = true;
        cb(streams.length > 0 ? streams : null);
      }
    }, 12e3);
    var pending = clickaTasks.length;
    clickaTasks.forEach(function(task) {
      var taskJar = {};
      var timeoutPromise = new Promise(function(_, reject) {
        setTimeout(function() {
          reject(new Error("Timeout resolving link"));
        }, 15e3);
      });
      Promise.race([
        resolveClickacc(task.url, task.kind, taskJar),
        timeoutPromise
      ]).then(function(streamObj) {
        if (streamObj && streamObj.url && !seen[streamObj.url]) {
          seen[streamObj.url] = true;
          streams.push(streamObj);
        }
      }).catch(function() {
      }).then(function() {
        pending--;
        if (pending === 0 && !resolved) {
          clearTimeout(timer);
          resolved = true;
          cb(streams.length > 0 ? streams : null);
        }
      });
    });
  });
}
module.exports = { getStreams };
