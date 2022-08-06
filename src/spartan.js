// Parts of this code adapted from: https://github.com/derhuerst/gemini
// License from that repository recreated here.
//
// Copyright (c) 2020, Jannis R
// 
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
// 
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
// SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION
// OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN
// CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
// 

const net = require('net');
const {parse: parseUrl} = require('url')
const {pipeline: pipelinepro} = require('stream/promises');
const {pipeline: pipe} = require('stream');
const {Transform} = require('stream')

const DEFAULT_PORT = 300

async function doSpartanRequest(event, url) {
  const parsedUrl = parseUrl(url)
  let connectionTimeoutMs = 20 * 1000

  //
  // Establish a connection
  //
  let connect_call = new Promise((resolve, reject) => {
    let client = new net.Socket();
    let socket = null
    let opts = {
      host: parsedUrl.hostname,
      port: parsedUrl.port || DEFAULT_PORT
    }
    socket = client.connect(opts)
    // We must set the error handler immediately. If we do not, there's a
    // real possibility that an error will occur before we have set the
    // error handler. Seems like a race condition. Is there a better way?
    socket.once('error', (err) => {
      reject(err)
    })
    socket.once('connect', () => {
      // If timeout is 0, then the existing idle timeout is disabled.
      // https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay
      socket.setTimeout(0)
      resolve(socket);
    })

    let timeoutTimer = null
    const onTimeout = () => {
      clearTimeout(timeoutTimer)
      const err = new Error('connect timeout')
      err.timeout = connectionTimeoutMs
      err.code = 'ETIMEDOUT' // is it okay to mimic syscall errors?
      err.errno = -60
      socket.destroy(err)
      reject(err)
    }
    socket.once('timeout', onTimeout)
    if (connectionTimeoutMs !== null) {
      // This sets the timeout for inactivity on the *socket* layer. But the
      // TLS handshake might also stall. This is why we also set one manually.
      // see also https://github.com/nodejs/node/issues/5757
      socket.setTimeout(connectionTimeoutMs)
      timeoutTimer = setTimeout(onTimeout, connectionTimeoutMs)
    }
  });

  let socket = null
  try {
    socket = await connect_call
  } catch (e) {
    throw e
    return Promise.reject(e);
  }

  const chunks = [];
  out = new Transform({
    write: (chunk, _, cb) => {
      chunks.push(Buffer.from(chunk) )
      cb()
    },
    writev: (chunks, cb) => {
      for (let i = 0; i < chunks.length; i++) {
        chunks.push(Buffer.from(chunk) )
        onData(chunks[i].chunk)
      }
      cb()
    },
  })

  //
  // Send request
  //
  let spartanPath = parsedUrl.path
  if (!parsedUrl.path || parsedUrl.path.length === 0) {
    // Per the spec, all paths must begin with '/'
    spartanPath = "/"
  }
  let result = ""
  socket.write(parsedUrl.host + " " + spartanPath + " " + "0" + '\r\n')

  try {
    await pipelinepro(
      socket,
      out
    );
    result = Buffer.concat(chunks).toString('utf8')
  } catch (e) {
    console.log("Caught error " + e);
    throw e
  }

  socket.end()

  return result
}

module.exports = doSpartanRequest
