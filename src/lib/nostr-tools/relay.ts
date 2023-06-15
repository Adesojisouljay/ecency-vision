/* global WebSocket */

import { Event, verifySignature, validateEvent } from "./event";
import { Filter } from "./filter";
import { SimplePoolOptions } from "./pool";

type RelayEvent = "connect" | "disconnect" | "error" | "notice" | "auth";

export type Relay = {
  enabled?: any;
  url: string;
  status: number;
  connect: () => Promise<void>;
  close: () => Promise<void>;
  sub: (filters: Filter[], opts?: SubscriptionOptions) => Sub;
  publish: (event: Event) => Pub;
  auth: (event: Event) => Pub;
  on: (type: RelayEvent, cb: any) => void;
  off: (type: RelayEvent, cb: any) => void;
};
export type Pub = {
  on: (type: "ok" | "seen" | "failed", cb: any) => void;
  off: (type: "ok" | "seen" | "failed", cb: any) => void;
};
export type Sub = {
  sub: (filters: Filter[], opts: SubscriptionOptions) => Sub;
  unsub: () => void;
  on: (type: "event" | "eose", cb: any) => void;
  off: (type: "event" | "eose", cb: any) => void;
};

type SubscriptionOptions = {
  skipVerification?: boolean;
  id?: string;
  alreadyHaveEvent?: any;
};

// TODO allowAuthor fn so we can skip JSON.parse and sig verify if we won't allow the author anyway
// export function relayInit(
//   url: string,
//   alreadyHaveEvent?: (id: string) => boolean
// ): Relay {
//   var ws: WebSocket
//   var resolveClose: () => void
//   var resolveOpen: (value: PromiseLike<void> | void) => void
//   var untilOpen = new Promise<void>(resolve => {
//     resolveOpen = resolve
//   })
//   var openSubs: {[id: string]: {filters: Filter[]} & SubscriptionOptions} = {}
//   var listeners: {
//     connect: Array<() => void>
//     disconnect: Array<() => void>
//     error: Array<() => void>
//     notice: Array<(msg: string) => void>
//     auth: Array<(challenge: string) => void>
//   } = {
//     connect: [],
//     disconnect: [],
//     error: [],
//     notice: [],
//     auth: []
//   }
//   var subListeners: {
//     [subid: string]: {
//       event: Array<(event: Event) => void>
//       eose: Array<() => void>
//     }
//   } = {}
//   var pubListeners: {
//     [eventid: string]: {
//       ok: Array<() => void>
//       seen: Array<() => void>
//       failed: Array<(reason: string) => void>
//     }
//   } = {}
//   let idRegex = /"id":"([a-fA-F0-9]+)"/

//   async function connectRelay(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       ws = new WebSocket(url)

//       ws.onopen = () => {
//         listeners.connect.forEach(cb => cb())
//         resolveOpen()
//         resolve()
//       }
//       ws.onerror = () => {
//         listeners.error.forEach(cb => cb())
//         reject()
//       }
//       ws.onclose = async () => {
//         listeners.disconnect.forEach(cb => cb())
//         resolveClose && resolveClose()
//       }

//       let incomingMessageQueue: any[] = []
//       let handleNextInterval: any

//       const handleNext = () => {
//         if (incomingMessageQueue.length === 0) {
//           clearInterval(handleNextInterval)
//           handleNextInterval = null
//           return
//         }

//         var data = incomingMessageQueue.shift()
//         if (data && alreadyHaveEvent !== undefined) {
//           const match = idRegex.exec(data)
//           if (match) {
//             const id = match[1]
//             if (alreadyHaveEvent(id)) {
//               //console.log(`already have`);
//               return
//             }
//           }
//         }
//         try {
//           data = JSON.parse(data)
//         } catch (err) {}

//         if (data.length >= 1) {
//           switch (data[0]) {
//             case 'EVENT':
//               if (data.length !== 3) return // ignore empty or malformed EVENT

//               let id = data[1]
//               let event = data[2]
//               if (
//                 validateEvent(event) &&
//                 openSubs[id] &&
//                 (openSubs[id].skipVerification || verifySignature(event)) &&
//                 matchFilters(openSubs[id].filters, event)
//               ) {
//                 openSubs[id]
//                 ;(subListeners[id]?.event || []).forEach(cb => cb(event))
//               }
//               return
//             case 'EOSE': {
//               if (data.length !== 2) return // ignore empty or malformed EOSE
//               let id = data[1]
//               ;(subListeners[id]?.eose || []).forEach(cb => cb())
//               return
//             }
//             case 'OK': {
//               if (data.length < 3) return // ignore empty or malformed OK
//               let id: string = data[1]
//               let ok: boolean = data[2]
//               let reason: string = data[3] || ''
//               if (ok) pubListeners[id]?.ok.forEach(cb => cb())
//               else pubListeners[id]?.failed.forEach(cb => cb(reason))
//               return
//             }
//             case 'NOTICE':
//               if (data.length !== 2) return // ignore empty or malformed NOTICE
//               let notice = data[1]
//               listeners.notice.forEach(cb => cb(notice))
//               return
//             case 'AUTH': {
//               let challenge = data[1]
//               listeners.auth?.forEach(cb => cb(challenge))
//               return
//             }
//           }
//         }
//       }

//       ws.onmessage = e => {
//         incomingMessageQueue.push(e.data)
//         if (!handleNextInterval) {
//           handleNextInterval = setInterval(handleNext, 0)
//         }
//       }
//     })
//   }

//   async function connect(): Promise<void> {
//     if (ws?.readyState && ws.readyState === 1) return // ws already open
//     await connectRelay()
//   }

//   async function trySend(params: [string, ...any]) {
//     let msg = JSON.stringify(params)

//     await untilOpen
//     try {
//       ws.send(msg)
//     } catch (err) {
//       console.log(err)
//     }
//   }

//   const sub = (
//     filters: Filter[],
//     {
//       skipVerification = false,
//       id = Math.random().toString().slice(2)
//     }: SubscriptionOptions = {}
//   ): Sub => {
//     let subid = id

//     openSubs[subid] = {
//       id: subid,
//       filters,
//       skipVerification
//     }
//     trySend(['REQ', subid, ...filters])

//     return {
//       sub: (newFilters, newOpts = {}) =>
//         sub(newFilters || filters, {
//           skipVerification: newOpts.skipVerification || skipVerification,
//           id: subid
//         }),
//       unsub: () => {
//         delete openSubs[subid]
//         delete subListeners[subid]
//         trySend(['CLOSE', subid])
//       },
//       on: (type: 'event' | 'eose', cb: any): void => {
//         subListeners[subid] = subListeners[subid] || {
//           event: [],
//           eose: []
//         }
//         subListeners[subid][type].push(cb)
//       },
//       off: (type: 'event' | 'eose', cb: any): void => {
//         let listeners = subListeners[subid]
//         let idx = listeners[type].indexOf(cb)
//         if (idx >= 0) listeners[type].splice(idx, 1)
//       }
//     }
//   }

//   function _publishEvent(event: Event, type: string) {
//     if (!event.id) throw new Error(`event ${event} has no id`)
//     let id = event.id

//     var sent = false
//     var mustMonitor = false

//     trySend([type, event])
//       .then(() => {
//         sent = true
//         if (mustMonitor) {
//           startMonitoring()
//           mustMonitor = false
//         }
//       })
//       .catch(() => {})

//     const startMonitoring = () => {
//       let monitor = sub([{ids: [id]}], {
//         id: `monitor-${id.slice(0, 5)}`
//       })
//       let willUnsub = setTimeout(() => {
//         ;(pubListeners[id]?.failed || []).forEach(cb =>
//           cb('event not seen after 5 seconds')
//         )
//         monitor.unsub()
//       }, 5000)
//       monitor.on('event', () => {
//         clearTimeout(willUnsub)
//         ;(pubListeners[id]?.seen || []).forEach(cb => cb())
//       })
//     }

//     return {
//       on: (type: 'ok' | 'seen' | 'failed', cb: any) => {
//         pubListeners[id] = pubListeners[id] || {
//           ok: [],
//           seen: [],
//           failed: []
//         }
//         pubListeners[id][type].push(cb)

//         if (type === 'seen') {
//           if (sent) startMonitoring()
//           else mustMonitor = true
//         }
//       },
//       off: (type: 'ok' | 'seen' | 'failed', cb: any) => {
//         let listeners = pubListeners[id]
//         if (!listeners) return
//         let idx = listeners[type].indexOf(cb)
//         if (idx >= 0) listeners[type].splice(idx, 1)
//       }
//     }
//   }

//   return {
//     url,
//     sub,
//     on: (type: RelayEvent, cb: any): void => {
//       listeners[type].push(cb)
//       if (type === 'connect' && ws?.readyState === 1) {
//         cb()
//       }
//     },
//     off: (type: RelayEvent, cb: any): void => {
//       let index = listeners[type].indexOf(cb)
//       if (index !== -1) listeners[type].splice(index, 1)
//     },
//     publish(event: Event): Pub {
//       return _publishEvent(event, 'EVENT')
//     },
//     auth(event: Event): Pub {
//       return _publishEvent(event, 'AUTH')
//     },
//     connect,
//     close(): Promise<void> {
//       ws.close()
//       return new Promise<void>(resolve => {
//         resolveClose = resolve
//       })
//     },
//     get status() {
//       return ws?.readyState ?? 3
//     }
//   }
// }

function getSubscriptionId(json) {
  let idx = json.slice(0, 22).indexOf(`"EVENT"`);
  if (idx === -1) return null;
  let pstart = json.slice(idx + 7 + 1).indexOf(`"`);
  if (pstart === -1) return null;
  let start = idx + 7 + 1 + pstart;
  let pend = json.slice(start + 1, 80).indexOf(`"`);
  if (pend === -1) return null;
  let end = start + 1 + pend;
  return json.slice(start + 1, end);
}

function getHex64(json, field) {
  let len = field.length + 3;
  let idx = json.indexOf(`"${field}":`) + len;
  let s = json.slice(idx).indexOf(`"`) + idx + 1;
  return json.slice(s, s + 64);
}

export function relayInit(url: string, options: SimplePoolOptions = {}) {
  let { listTimeout = 3e3, getTimeout = 3e3 } = options;
  var ws;
  var openSubs = {};
  var listeners = {
    connect: [],
    disconnect: [],
    error: [],
    notice: []
  };
  var subListeners = {};
  var pubListeners = {};
  var connectionPromise;
  async function connectRelay() {
    if (connectionPromise) return connectionPromise;
    connectionPromise = new Promise<void>((resolve, reject) => {
      try {
        ws = new WebSocket(url);
      } catch (err) {
        reject(err);
      }
      ws.onopen = () => {
        listeners.connect.forEach((cb) => cb());
        resolve();
      };
      ws.onerror = () => {
        connectionPromise = void 0;
        listeners.error.forEach((cb) => cb());
        reject();
      };
      ws.onclose = async () => {
        connectionPromise = void 0;
        listeners.disconnect.forEach((cb) => cb());
      };
      let incomingMessageQueue = [];
      let handleNextInterval;
      ws.onmessage = (e) => {
        incomingMessageQueue.push(e.data);
        if (!handleNextInterval) {
          handleNextInterval = setInterval(handleNext, 0);
        }
      };
      async function handleNext() {
        if (incomingMessageQueue.length === 0) {
          clearInterval(handleNextInterval);
          handleNextInterval = null;
          return;
        }
        var json = incomingMessageQueue.shift();
        if (!json) return;
        let subid = getSubscriptionId(json);
        if (subid) {
          let so = openSubs[subid];
          if (so && so.alreadyHaveEvent && so.alreadyHaveEvent(getHex64(json, "id"), url)) {
            return;
          }
        }
        try {
          let data = JSON.parse(json);
          switch (data[0]) {
            case "EVENT":
              let id = data[1];
              let event = data[2];
              if (
                validateEvent(event) &&
                openSubs[id] &&
                (openSubs[id].skipVerification || (await verifySignature(event)))
              ) {
                openSubs[id];
                (subListeners[id]?.event || []).forEach((cb) => cb(event));
              }
              return;
            case "EOSE": {
              let id2 = data[1];
              if (id2 in subListeners) {
                subListeners[id2].eose.forEach((cb) => cb());
                subListeners[id2].eose = [];
              }
              return;
            }
            case "OK": {
              let id2 = data[1];
              let ok = data[2];
              let reason = data[3] || "";
              if (id2 in pubListeners) {
                if (ok) pubListeners[id2].ok.forEach((cb) => cb());
                else pubListeners[id2].failed.forEach((cb) => cb(reason));
                pubListeners[id2].ok = [];
                pubListeners[id2].failed = [];
              }
              return;
            }
            case "NOTICE":
              let notice = data[1];
              listeners.notice.forEach((cb) => cb(notice));
              return;
          }
        } catch (err) {
          return;
        }
      }
    });
    return connectionPromise;
  }
  function connected() {
    return ws?.readyState === 1;
  }
  async function connect() {
    if (connected()) return;
    await connectRelay();
  }
  async function trySend(params) {
    let msg = JSON.stringify(params);
    if (!connected()) {
      await new Promise((resolve) => setTimeout(resolve, 1e3));
      if (!connected()) {
        return;
      }
    }
    try {
      ws.send(msg);
    } catch (err) {
      console.log(err);
    }
  }
  const sub = (
    filters,
    {
      skipVerification = false,
      alreadyHaveEvent = null,
      id = Math.random().toString().slice(2)
    } = {}
  ) => {
    let subid = id;
    openSubs[subid] = {
      id: subid,
      filters,
      skipVerification,
      alreadyHaveEvent
    };
    trySend(["REQ", subid, ...filters]);
    return {
      sub: (newFilters, newOpts: SubscriptionOptions = {}) =>
        sub(newFilters || filters, {
          skipVerification: newOpts.skipVerification || skipVerification,
          alreadyHaveEvent: newOpts.alreadyHaveEvent || alreadyHaveEvent,
          id: subid
        }),
      unsub: () => {
        delete openSubs[subid];
        delete subListeners[subid];
        trySend(["CLOSE", subid]);
      },
      on: (type, cb) => {
        subListeners[subid] = subListeners[subid] || {
          event: [],
          eose: []
        };
        subListeners[subid][type].push(cb);
      },
      off: (type, cb) => {
        let listeners2 = subListeners[subid];
        let idx = listeners2[type].indexOf(cb);
        if (idx >= 0) listeners2[type].splice(idx, 1);
      }
    };
  };
  return {
    url,
    sub,
    on: (type, cb) => {
      listeners[type].push(cb);
      if (type === "connect" && ws?.readyState === 1) {
        cb();
      }
    },
    off: (type, cb) => {
      let index = listeners[type].indexOf(cb);
      if (index !== -1) listeners[type].splice(index, 1);
    },
    list: (filters, opts) =>
      new Promise((resolve) => {
        let s = sub(filters, opts);
        let events = [];
        let timeout = setTimeout(() => {
          s.unsub();
          resolve(events);
        }, listTimeout);
        s.on("eose", () => {
          s.unsub();
          clearTimeout(timeout);
          resolve(events);
        });
        s.on("event", (event) => {
          events.push(event);
        });
      }),
    get: (filter, opts) =>
      new Promise((resolve) => {
        let s = sub([filter], opts);
        let timeout = setTimeout(() => {
          s.unsub();
          resolve(null);
        }, getTimeout);
        s.on("event", (event) => {
          s.unsub();
          clearTimeout(timeout);
          resolve(event);
        });
      }),
    publish(event) {
      if (!event.id) throw new Error(`event ${event} has no id`);
      let id = event.id;
      trySend(["EVENT", event]);
      return {
        on: (type, cb) => {
          pubListeners[id] = pubListeners[id] || {
            ok: [],
            failed: []
          };
          pubListeners[id][type].push(cb);
        },
        off: (type, cb) => {
          let listeners2 = pubListeners[id];
          if (!listeners2) return;
          let idx = listeners2[type].indexOf(cb);
          if (idx >= 0) listeners2[type].splice(idx, 1);
        }
      };
    },
    connect,
    close() {
      listeners = { connect: [], disconnect: [], error: [], notice: [] };
      subListeners = {};
      pubListeners = {};
      if (ws.readyState === WebSocket.OPEN) {
        ws?.close();
      }
    },
    status() {
      return ws?.readyState ?? 3;
    }
  };
}
