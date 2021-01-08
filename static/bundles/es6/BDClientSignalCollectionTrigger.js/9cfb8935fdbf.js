__d(function(g, r, i, a, m, e, d) {
    'use strict';
    Object.defineProperty(e, '__esModule', {
        value: !0
    });
    const {
        OPERATIONS: t
    } = r(d[0]), n = 'BDClientSignalCollectionTrigger', l = 'signal_flush_timestamp';
    let s, o, c = !1,
        S = !1,
        I = !1,
        T = 0,
        u = 0,
        b = 0,
        E = 30,
        C = 5;
    const A = r(d[1]).uuid(),
        p = r(d[2]).get(),
        O = Object.freeze({
            NONE: 0,
            VITAL: 1,
            CRITICAL: 2
        }),
        R = 'hb_timestamp';
    class _ {
        static async startSignalCollection(l) {
            if (!c && null != l) {
                if (c = !0, r(d[3]).parseConfig(l), !p.isParsingDone()) return r(d[4]).logError(n, t.PARSE_CONFIG_ERROR, {
                    config: JSON.stringify(l)
                }), void(c = !1);
                if (null != l && null != l.hbc) {
                    const t = l.hbc;
                    u = t.hbcbc && t.hbcbc > 0 ? t.hbcbc : u, b = t.hbvbc && t.hbvbc > 0 ? t.hbvbc : b, E = t.hbbi && t.hbbi > 0 ? t.hbbi : E
                }
                _.startHeartbeatDelayed(), o = new Promise((l, s) => {
                    try {
                        p.getClientReputationTier() !== r(d[5]).BENIGN_IGNORE && (p.getDynamicSignals().length > 0 && (_.collectDynamicSignals(), r(d[4]).logInfo(n, t.DYNAMIC_SIGNAL_COLLECTION_STARTED, {
                            ts: Date.now().toString()
                        })), p.getBiometricSignals().length > 0 && (_.collectBiometricSignals(), r(d[4]).logInfo(n, t.BIOMETRIC_SIGNAL_COLLECTION_STARTED, {
                            ts: Date.now().toString()
                        }))), l()
                    } catch (t) {
                        s(t)
                    }
                }), p.getClientReputationTier() !== r(d[5]).BENIGN_IGNORE && (await o, await _.startSignalPosting())
            }
            c && !S && !I && C > 0 && (C -= 1, r(d[4]).logWarning(n, t.TRY_RESTARTING_HB), _.startHeartbeatDelayed())
        }
        static async retrieveSignals() {
            await o, await _.postSignals([r(d[6]).DYNAMIC, r(d[6]).BIOMETRIC, r(d[6]).STATIC])
        }
        static async postSignals(t) {
            await _.collectStaticSignals(), _.postSignalsHelper(r(d[7]).getSignalsAsJSONString(t), O.NONE) && _.setTimestampInStorage(Date.now(), l)
        }
        static postSignalsHelper(t, n) {
            if (t.length <= 2) return !1;
            const l = p.getConfigGenerationTimeStamp(),
                s = p.getClientReputationTier(),
                o = _.encryptDataUsingAsid(A, t);
            return i(d[8]).log(() => ({
                asid: A,
                ct: l,
                rt: s,
                sjd: o,
                sid: p.sid
            })), !0
        }
        static getInitialVector(l) {
            if (16 !== l.length) return r(d[4]).logError(n, t.INVALID_LENGTH), '';
            let s = '';
            for (let t = 0; t < 8; t++) s += String.fromCharCode(l.charCodeAt(t) ^ l.charCodeAt(8 + t));
            return s
        }
        static encryptDataUsingAsid(l, s) {
            if (36 !== l.length) return r(d[4]).logError(n, t.INVALID_GUID), s;
            const o = l.slice(19, 23) + l.slice(24, 36),
                c = _.getInitialVector(o),
                S = new(i(d[9]))(o, 'cbc');
            return S.base64Encode(S.encrypt(s, c))
        }
        static async startSignalPosting() {
            const t = _.getTimestampInStorage(l),
                n = Date.now() - t;
            n >= p.getAllTiersFlushDurationMs() ? await _.postSignalsIntermittently() : window.setTimeout(() => {
                _.postSignalsIntermittently()
            }, p.getAllTiersFlushDurationMs() - n)
        }
        static postSignalsIntermittently() {
            _.postSignals([r(d[6]).STATIC]), window.setInterval(() => {
                _.postSignals([r(d[6]).STATIC, r(d[6]).DYNAMIC, r(d[6]).BIOMETRIC])
            }, p.getAllTiersFlushDurationMs())
        }
        static setTimestampInStorage(l, s) {
            const o = r(d[10]).getLocalStorage();
            if (!o) return void r(d[4]).logWarning(n, t.GET_LOCAL_STORAGE_ERROR);
            const c = r(d[10]).setItemGuarded(o, s, l.toString());
            null != c && r(d[4]).logWarning(n, t.WEB_STORAGE, {
                error: c.message
            })
        }
        static getTimestampInStorage(l) {
            const s = r(d[10]).getLocalStorage();
            if (!s) return r(d[4]).logWarning(n, t.GET_LOCAL_STORAGE_ERROR), 0;
            const o = s.getItem(l);
            if (null == o) return 0;
            const c = Number.parseInt(o, 10);
            return Number.isFinite(c) ? c : 0
        }
        static resetHeartbeatStartedForTest() {
            S = !1, I = !1
        }
        static startHeartbeatDelayed() {
            if (S || I) return;
            const l = _.getTimestampInStorage(R),
                s = Date.now() - l;
            try {
                s >= p.getHeartbeatIntervalMs() ? _.startHeartbeat() : (window.setTimeout(() => _.startHeartbeat(), p.getHeartbeatIntervalMs() - s), I = !0)
            } catch (l) {
                r(d[4]).logError(n, t.HB_START_FAILURE, {
                    lastBeatSince: s.toString(),
                    hbi: p.getHeartbeatIntervalMs().toString(),
                    e: l
                })
            }
        }
        static startHeartbeat() {
            !S && p.getHeartbeatIntervalMs() > 0 && (_.collectHeartbeatTimes(u, b), 0 !== T && (window.clearInterval(T), r(d[4]).logWarning(n, t.HB_ALREADY_RUNNING)), T = window.setInterval(() => _.collectHeartbeatTimes(u, b), p.getHeartbeatIntervalMs()), S = !0)
        }
        static collectHeartbeatTimes(t, n) {
            t <= 0 && n <= 0 || (t > 0 && _.collectHeartbeat(O.CRITICAL), n > 0 && _.collectHeartbeat(O.VITAL), (t > 1 || n > 1) && window.setTimeout(() => _.collectHeartbeatTimes(t - 1, n - 1), 1e3 * E))
        }
        static collectHeartbeat(l) {
            var s, o;
            const c = null === p || void 0 === p ? void 0 : null === (s = p.getHeartbeatSignal()) || void 0 === s ? void 0 : null === (o = s.getSignalCollector(p.getClientReputationTier())) || void 0 === o ? void 0 : o.executeSignalCollection();
            null != c ? (r(d[4]).logInfo(n, t.HB_COLLECTED, {
                urgency: l.toString()
            }), _.postHeartbeat(l, c) && _.setTimestampInStorage(Date.now(), R)) : r(d[4]).logError(n, t.HB_COLLECTION_FAILED, {
                urgency: l.toString()
            })
        }
        static postHeartbeat(t, n) {
            const l = {};
            l[r(d[11]).HEARTBEAT_V2] = [null === n || void 0 === n ? void 0 : n.valueOrError];
            const s = JSON.stringify(l);
            return _.postSignalsHelper(s, t)
        }
        static async collectStaticSignals() {
            await _.collectSignalsOneTime(p.getStaticSignals())
        }
        static collectDynamicSignals() {
            _.stopDynamicSignalCollection(), s = window.setInterval(async () => {
                await _.collectSignalsOneTime(p.getDynamicSignals())
            }, p.getPeriodicCollectionIntervalMs())
        }
        static collectBiometricSignals() {
            _.collectSignalsOneTime(p.getBiometricSignals())
        }
        static postBiometricSignals() {
            _.postSignalsHelper(r(d[7]).getSignalsAsJSONString([r(d[6]).BIOMETRIC]), O.NONE) && r(d[7]).clearBiometricSignals()
        }
        static stopDynamicSignalCollection() {
            null != s && (window.clearInterval(s), s = null)
        }
        static async collectSignalsOneTime(t) {
            const n = p.getClientReputationTier();
            n !== r(d[5]).BENIGN_IGNORE && await r(d[12]).get().collectSignals(t, n)
        }
        static resetStartedForTest() {
            c = !1
        }
    }
    e.HEARTBEAT_TIMESTAMP_STORAGE_KEY = R, e.BDClientSignalCollectionTrigger = _
}, 19136512, [19136513, 19136514, 19136515, 19136516, 19136517, 19136518, 19136519, 19136520, 19136521, 19136522, 10092548, 19136523, 19136524]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    m.exports = {
        LEVELS: {
            ERROR: 'error',
            WARNING: 'warning',
            INFO: 'info'
        },
        OPERATIONS: {
            KEY_NOT_FOUND: 'key_not_found',
            APPEND_SIGNAL: 'bd_append_signal',
            APPEND_SIGNAL_FAIL: 'bd_append_signal_fail',
            HB_COLLECTED: 'append_hb',
            HB_COLLECTION_FAILED: 'hb_collection_failed',
            BD_EXCEPTION: 'bd_exception',
            SIGNAL_NOT_IMPLEMENTED: 'signal_not_implemented',
            SIGNAL_VALUE_NULL: 'signal_value_null',
            EMPTY_SIGNAL_CONFIG: 'empty_signal_config',
            INVALID_BUFFER_SIZE: 'invalid_buffer_size',
            INVALID_DURATION: 'invalid_duration',
            SIGNAL_FLAGS_MISSING: 'signal_flags_missing',
            DYNAMIC_SIGNAL_COLLECTION_STARTED: 'dynamic_signal_collection_started',
            BIOMETRIC_SIGNAL_COLLECTION_STARTED: 'biometric_signal_collection_started',
            INVALID_GUID: 'invalid_guid',
            INVALID_LENGTH: 'invalid_length',
            GET_LOCAL_STORAGE_ERROR: 'get_local_storage_error',
            WEB_STORAGE: 'web_storage',
            PARSE_CONFIG_ERROR: 'parse_config_error',
            HB_START_FAILURE: 'hb_start_failure',
            HB_ALREADY_RUNNING: 'hb_already_running',
            TRY_RESTARTING_HB: 'try_restarting_hb',
            BANZAI_LOG_ERROR: 'banzai_log_error'
        },
        COMPONENT_NAME: 'JS'
    }
}, 19136513, []);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    const x = {
        uuid: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, x => {
            const t = 16 * Math.random() | 0;
            return ('x' === x ? t : 3 & t | 8).toString(16)
        })
    };
    m.exports = x
}, 19136514, []);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    const {
        OPERATIONS: t
    } = r(d[0]), s = 'BDClientConfig';
    let n = null;
    const l = {
        get: () => (null == n && (n = new class {
            constructor() {
                this.reputationTier = r(d[1]).BENIGN_IGNORE, this.staticSignalBufferSize = 1, this.dynamicSignalBufferSize = 1, this.biometricSignalBufferSize = 1, this.staticSignals = [], this.dynamicSignals = [], this.biometricSignals = [], this.heartbeatSignal = new(r(d[2]))([], r(d[3]).HEARTBEAT_V2), this.bufferSizeBySignalIdMap = {}, this.periodicCollectionIntervalMs = Number.MAX_SAFE_INTEGER, this.signalConfigGenerationTimeStampMs = 0, this.suspiciousTiersFlushDurationMs = Number.MAX_SAFE_INTEGER, this.allTiersFlushDurationMs = Number.MAX_SAFE_INTEGER, this.heartbeatIntervalMs = -1, this.parsingDone = !1, this.sid = -1, this.hbVersion = '', this.bufferSizeBySignalIdMap[r(d[3]).HEARTBEAT_V2] = 1
            }
            setClientReputationTier(t) {
                return this.reputationTier = t, this
            }
            getClientReputationTier() {
                return this.reputationTier
            }
            setStaticSignalBufferSize(n) {
                return n > 0 ? this.staticSignalBufferSize = n : r(d[4]).logError(s, t.INVALID_BUFFER_SIZE, {
                    size: n.toString(),
                    type: 's'
                }), this
            }
            getStaticSignalBufferSize() {
                return this.staticSignalBufferSize
            }
            setDynamicSignalBufferSize(n) {
                return n > 1 ? this.dynamicSignalBufferSize = n : r(d[4]).logError(s, t.INVALID_BUFFER_SIZE, {
                    size: n ? n.toString() : '0',
                    type: 'dbs'
                }), this
            }
            getDynamicSignalBufferSize() {
                return this.dynamicSignalBufferSize
            }
            setBiometricSignalBufferSize(n) {
                return n > 1 ? this.biometricSignalBufferSize = n : r(d[4]).logError(s, t.INVALID_BUFFER_SIZE, {
                    size: n.toString(),
                    type: 'b'
                }), this
            }
            setSID(t) {
                return this.sid = t, this
            }
            setHeartbeatVersion(t) {
                return this.hbVersion = t, this
            }
            getHeartbeatVersion() {
                return this.hbVersion
            }
            getBiometricSignalBufferSize() {
                return this.biometricSignalBufferSize
            }
            setConfigGenerationTimeStamp(t) {
                return this.signalConfigGenerationTimeStampMs = t, this
            }
            getConfigGenerationTimeStamp() {
                return this.signalConfigGenerationTimeStampMs
            }
            setHeartbeatIntervalMinutes(t) {
                return this.heartbeatIntervalMs = 60 * t * 1e3, this
            }
            getHeartbeatIntervalMs() {
                return this.heartbeatIntervalMs
            }
            setAllTiersFlushDurationMinutes(n) {
                return n > 0 ? this.allTiersFlushDurationMs = 60 * n * 1e3 : r(d[4]).logError(s, t.INVALID_DURATION, {
                    size: n.toString(),
                    type: 'fda'
                }), this
            }
            getAllTiersFlushDurationMs() {
                return this.allTiersFlushDurationMs
            }
            getFlushDurationByReputationTierMs() {
                return this.reputationTier === r(d[1]).BENIGN ? this.allTiersFlushDurationMs : this.suspiciousTiersFlushDurationMs
            }
            addMultipleSignalsToClientConfig(t) {
                return t.forEach(t => this.addSignalToClientConfig(t)), this
            }
            addSignalToClientConfig(t) {
                const s = t.getSignalFlags(),
                    n = t.getSignalId();
                if (n === r(d[3]).HEARTBEAT) return this;
                const l = new(r(d[2]))(s, n);
                return n === r(d[3]).HEARTBEAT_V2 ? (this.heartbeatSignal = l, this) : (s.includes(r(d[5]).DYNAMIC) ? s.includes(r(d[5]).BIOMETRIC) ? this.biometricSignals.push(l) : this.dynamicSignals.push(l) : this.staticSignals.push(l), t.getBufferSize() > 0 && (this.bufferSizeBySignalIdMap[t.getSignalId()] = t.getBufferSize()), this)
            }
            setPeriodicCollectionIntervalSeconds(n) {
                return n > 0 ? this.periodicCollectionIntervalMs = 1e3 * n : r(d[4]).logError(s, t.INVALID_DURATION, {
                    size: n ? n.toString() : 'INF',
                    type: 'i'
                }), this
            }
            getPeriodicCollectionIntervalMs() {
                return this.periodicCollectionIntervalMs
            }
            getDynamicSignals() {
                return this.dynamicSignals
            }
            getStaticSignals() {
                return this.staticSignals
            }
            getBiometricSignals() {
                return this.biometricSignals
            }
            getHeartbeatSignal() {
                return this.heartbeatSignal
            }
            getBufferSizeBySignalId(t) {
                return this.bufferSizeBySignalIdMap[t]
            }
            setParsingDone(t) {
                this.parsingDone = t
            }
            isParsingDone() {
                return this.parsingDone
            }
        }), n)
    };
    m.exports = l
}, 19136515, [19136513, 19136518, 19136525, 19136523, 19136517, 19136526]);
__d(function(g, r, i, a, m, e, d) {
    m.exports = Object.freeze({
        BENIGN_IGNORE: 0,
        SUSPICIOUS: 1024,
        PARANOID: 2048,
        RANDOM_SAMPLE_DEPRECATED: 4096,
        BENIGN: 262144,
        EMPLOYEES: 524288
    })
}, 19136518, []);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    m.exports = class {
        constructor(t, s) {
            this.signalFlags = t, this.signalType = s
        }
        getSignalCollector(t) {
            if (this.canExecuteForReputationTier(t)) {
                var s;
                return null === (s = r(d[0])[this.signalType]) || void 0 === s ? void 0 : s.get(this.signalFlags)
            }
            return null
        }
        canExecuteForReputationTier(t) {
            return this.signalType === r(d[1]).HEARTBEAT_V2 || this.signalFlags.includes(t)
        }
        getBufferConfig() {
            return r(d[2])[this.signalType]
        }
    }
}, 19136525, [19136527, 19136523, 19136528]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    const t = {
        30000: r(d[0]),
        30001: r(d[1]),
        30002: r(d[2]),
        30003: r(d[3]),
        30004: r(d[4]),
        30005: r(d[5]),
        30007: r(d[6]),
        30012: r(d[7]),
        30015: r(d[8]),
        38001: r(d[9])
    };
    m.exports = t
}, 19136527, [19136529, 19136530, 19136531, 19136532, 19136533, 19136534, 19136535, 19136536, 19136537, 19136538]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    let t = null;
    const n = {
        signalType: r(d[2]).WEBDRIVER,
        get: () => (null == t && (t = new class extends(r(d[1])) {
            constructor() {
                super(n.signalType)
            }
            executeSignalCollection() {
                this.throwIfNotInitialized();
                const t = !!navigator.webdriver;
                return {
                    valueOrError: new(r(d[0]))(Date.now(), this.getContext(), t)
                }
            }
        }), t)
    };
    m.exports = n
}, 19136529, [19136539, 19136540, 19136523]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    m.exports = class extends r(d[0]).SignalValueTypeDef {
        constructor(s, t, c) {
            super(s, t, c, r(d[0]).VALUE_TYPES.BOOLEAN)
        }
    }
}, 19136539, [19136541]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    const {
        OPERATIONS: t
    } = r(d[0]), l = 'SignalValueTypeDef', n = 't', u = 'ctx', s = 'v', S = 'e', T = {
        NUMBER: 'NUMBER',
        STRING: 'STRING',
        BOOLEAN: 'BOOLEAN',
        CUSTOM_OBJECT: 'CUSTOM_OBJECT',
        INT_ARRAY: 'INT_ARRAY',
        TOUCH: 'TOUCH',
        MAP: 'MAP',
        LIST: 'LIST',
        SENSOR: 'SENSOR',
        ERROR: 'ERROR'
    };
    m.exports = {
        SignalValueTypeDef: class {
            constructor(t, l, n, u, s) {
                this.$SignalValueTypeDef1 = t, this.$SignalValueTypeDef2 = l, this.$SignalValueTypeDef3 = n, this.$SignalValueTypeDef4 = u, this.$SignalValueTypeDef5 = null != s ? s : 0
            }
            getTimeStampMS() {
                return this.$SignalValueTypeDef1
            }
            getSignalContext() {
                return this.$SignalValueTypeDef2
            }
            getSignalValue() {
                return this.$SignalValueTypeDef3
            }
            getSignalValueType() {
                return this.$SignalValueTypeDef4
            }
            isEqual(n, u) {
                if (null == n) return r(d[1]).logWarning(l, t.SIGNAL_VALUE_NULL), !1;
                if (this.getSignalValueType() !== n.getSignalValueType()) return !1;
                if (this.getSignalValueType() === T.ERROR && n.getSignalValueType() === T.ERROR) return this.equalValue(n);
                let s = !1;
                return u.has(r(d[2]).EQUAL_BY_VALUE) && (s = this.equalValue(n)), u.has(r(d[2]).EQUAL_BY_CONTEXT) && (s = s && null != this.getSignalContext() && null != n.getSignalContext() && this.getSignalContext().getSignalValueContextName() === n.getSignalContext().getSignalValueContextName()), u.has(r(d[2]).EQUAL_BY_TIMESTAMP) && (s = s && Math.abs(this.getTimeStampMS() - n.getTimeStampMS()) <= this.$SignalValueTypeDef5), s
            }
            equalValue(t) {
                if (this.isPrimitiveType()) return this.getSignalValue() === t.getSignalValue();
                throw new Error('Must implement in the subclasses')
            }
            toJSON(t) {
                const l = {};
                return t && (l[n] = this.$SignalValueTypeDef1 / 1e3, null != this.$SignalValueTypeDef2 && (l[u] = this.$SignalValueTypeDef2)), null == this.$SignalValueTypeDef3 ? l[S] = new(r(d[3]).SignalErrorValueTypeDef)(r(d[4]).NULL) : this.addValueOrErrorToJSON(l), l
            }
            addValueOrErrorToJSON(t) {
                if (!this.isPrimitiveType()) throw new Error('Must implement in the subclasses');
                t[s] = this.$SignalValueTypeDef3
            }
            isPrimitiveType() {
                switch (typeof this.$SignalValueTypeDef3) {
                    case 'number':
                    case 'boolean':
                    case 'string':
                        return !0;
                    default:
                        return !1
                }
            }
        },
        VALUE_TYPES: T,
        BD_VALUE: s,
        BD_ERROR: S
    }
}, 19136541, [19136513, 19136517, 19136526, 19136542, 19136543]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    const o = {
        logInfo(n, l, t, E) {
            o.log(n, i(d[0]).INFO, l, t, E)
        },
        logWarning(n, l, t, E) {
            o.log(n, i(d[0]).WARNING, l, t, E)
        },
        logError(n, l, t, E) {
            o.log(n, i(d[0]).ERROR, l, t, E)
        },
        log(n, l, t, E = {}, _) {
            if (r(d[1]).coinflip(o.getFlipSamplingByOperation(t))) {
                if (null === E) throw new Error('opeartion info null');
                E.source = n, i(d[2]).log(() => ({
                    operation: t,
                    level: l,
                    component: i(d[3]).IG_JS,
                    operation_info: E,
                    duration_us: _
                }))
            }
        },
        getFlipSamplingByOperation(o) {
            const n = r(d[4]).OPERATIONS;
            switch (o) {
                case n.APPEND_SIGNAL:
                case n.HB_COLLECTED:
                case n.GET_LOCAL_STORAGE_ERROR:
                case n.WEB_STORAGE:
                case n.SIGNAL_NOT_IMPLEMENTED:
                case n.BIOMETRIC_SIGNAL_COLLECTION_STARTED:
                    return 1e3;
                default:
                    return 1
            }
        }
    };
    m.exports = o
}, 19136517, [19136544, 19136545, 19136546, 19136547, 19136513]);
__d(function(g, r, i, a, m, e, d) {
    m.exports = Object.freeze({
        INFO: 'info',
        WARNING: 'warning',
        ERROR: 'error'
    })
}, 19136544, []);
__d(function(g, r, i, a, m, e, d) {
    "use strict";
    Object.defineProperty(e, '__esModule', {
        value: !0
    });
    const o = {
        falco: !0,
        pigeon: !1
    };
    e.default = class {
        static log(t) {
            r(d[0]).FalcoLogger.log('bd_operation', t(), {}, o)
        }
    }
}, 19136546, [9764876]);
__d(function(g, r, i, a, m, e, d) {
    m.exports = Object.freeze({
        WEB_SIGNAL_COLLECTION: 'JS',
        ANDROID_SIGNAL_COLLECTION: 'Java',
        IOS_SIGNAL_COLLECTION: 'ObjC',
        SIGNAL_COLLECTION_SERVER_PROCESSING: 'SCSP',
        TRIGGER: 'TG',
        SESSION_STORE: 'SS',
        SCANNERS_FRAMEWORK: 'SF',
        RESEARCHER_STUDIO_SERVER_SIDE: 'RS',
        RESEARCHER_STUDIO_CLIENT_SIDE: 'RSJS',
        SIGNAL_COLLECTION_CONFIG: 'SCCFG',
        COLLECTION_TRIGGER_FB: 'CTFB',
        CLASSIFICATION_TRIGGER_FB: 'ClsTF',
        PASSIVE_SIGNALS_FB: 'PSFB',
        FB_ACTIVE_SIGNAL: 'FB_AS',
        IG_ACTIVE_SIGNAL: 'IG_AS',
        BD_STORE: 'ST',
        REPUTATION_HINTS_FB: 'RHF',
        FALCO_EVENT: 'FE',
        USERAGENT_PARSING: 'UA',
        FEATURE_LIMIT: 'FL',
        IG_JS: 'IG_JS'
    })
}, 19136547, []);
__d(function(g, r, i, a, m, e, d) {
    m.exports = Object.freeze({
        ACTIVE: 1,
        DYNAMIC: 2,
        BIOMETRIC: 4,
        DEPRECATED: 8,
        WEB: 16,
        IOS_NATIVE: 32,
        ANDROID_NATIVE: 64,
        EQUAL_BY_VALUE: 128,
        EQUAL_BY_CONTEXT: 256,
        EQUAL_BY_TIMESTAMP: 512,
        SUSPICIOUS_TIER: 1024,
        PARANOID_TIER: 2048,
        RANDOM_SAMPLE_TIER_DEPRECATED: 4096,
        BENIGN_TIER: 262144,
        EMPLOYEES_TIER: 524288,
        BUNDLE: 8192,
        ONSITE: 16384,
        OFFSITE: 32768,
        OFFSITE_SENSITIVE: 65536,
        SENSITIVE: 131072
    })
}, 19136526, []);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    const t = 'ec',
        l = 'en',
        o = 'es',
        s = 500;
    m.exports = {
        SignalErrorValueTypeDef: class {
            constructor(t, l, o) {
                this.$SignalErrorValueTypeDef1 = t, this.$SignalErrorValueTypeDef2 = l, null != o && (this.$SignalErrorValueTypeDef3 = o.substr(0, s))
            }
            getErrorCode() {
                return this.$SignalErrorValueTypeDef1
            }
            getErrorName() {
                return this.$SignalErrorValueTypeDef2
            }
            getErrorDetails() {
                return this.$SignalErrorValueTypeDef3
            }
            isEqual(t) {
                return this.$SignalErrorValueTypeDef1 === t.getErrorCode() && this.$SignalErrorValueTypeDef3 === t.getErrorDetails() && this.$SignalErrorValueTypeDef2 === t.getErrorName()
            }
            toJSON() {
                const s = {};
                switch (s[t] = this.$SignalErrorValueTypeDef1, this.$SignalErrorValueTypeDef1) {
                    case r(d[0]).UNKNOWN:
                        s[l] = this.$SignalErrorValueTypeDef2, s[o] = this.$SignalErrorValueTypeDef3
                }
                return s
            }
        }
    }
}, 19136542, [19136543]);
__d(function(g, r, i, a, m, e, d) {
    m.exports = Object.freeze({
        UNKNOWN: 0,
        NO_PERMISSION: 1,
        NULL: 2,
        NOT_SUPPORTED: 3,
        NOT_IMPLEMENTED: 4
    })
}, 19136543, []);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    class t {
        constructor(t) {
            this.signalType = t
        }
        executeSignalCollection() {
            throw new Error('Child class responsibility to implement executeSignalCollection')
        }
        async executeAsyncSignalCollection() {
            return await this.executeSignalCollection()
        }
        static getSanitizedURI() {
            const t = window.location.href,
                n = t.indexOf('?');
            return n < 0 ? t : t.substring(0, n)
        }
        getContext() {
            return new(r(d[0]))(t.getSanitizedURI())
        }
        throwIfNotInitialized() {
            if (!(this.signalType in r(d[1]))) throw new Error('Signal is not intialized')
        }
    }
    m.exports = t
}, 19136540, [19136548, 19136528]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    m.exports = class {
        constructor(t) {
            this.cn = t
        }
        getSignalValueContextName() {
            return this.cn
        }
    }
}, 19136548, []);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    m.exports = {}
}, 19136528, []);
__d(function(g, r, i, a, m, e, d) {
    m.exports = Object.freeze({
        TEST_SIGNAL: 0,
        SSL_FINGERPRINT: 1,
        HTTP_FINGERPRINT: 2,
        TCP_FINGERPRINT: 3,
        HTTP_PARAMS_FINGERPRINT: 4,
        TCP_FINGERPRINT_V2: 5,
        SRC_IP_ADDRESS: 50,
        USER_AGENT: 51,
        USER_AGENT_MD5: 52,
        CSRF_TOKEN: 53,
        ALITE_CONTROLLER: 54,
        REQUEST_INTERFACE: 55,
        GETISH_REQUEST: 56,
        REQUEST_METHOD: 57,
        GRAPHQL_QUERY_IDS: 58,
        RESTSERVER_METHOD: 59,
        GRAPH_API_PATH: 60,
        RELATIVE_SCRIPT_PATH: 61,
        DATR_COOKIE: 62,
        X_FORWARDED_FOR: 63,
        ASN: 64,
        SAFETYNET_RESULT_STATUS: 90,
        MACHINE_ID_COOKIE: 200,
        VIEW_NAME: 201,
        APP_ID: 202,
        RLE_ENDPOINT_KEY: 203,
        RESPONSE_CONTENT_SIZE: 204,
        RESPONSE_CODE: 205,
        RATE_LIMITER_QUOTA: 206,
        CLOUD_HOSTING_SCORE: 207,
        DEVICE_IP_ADDRESSES: 10001,
        DEVICE_MAC_ADDRESSES: 10002,
        APP_MD5: 10003,
        APP_SHA1: 10004,
        APP_SHA256: 10005,
        APP_CERTIFICATES_HASHES: 10006,
        APP_SIZE: 10007,
        APP_LIFECYCLE_STATE_CHANGE: 10008,
        APP_FROSTING_BLOCK: 10009,
        APP_DEX_MD5: 10010,
        APP_CAMERA_STATE_CHANGE: 10011,
        WO_EVENT_ID: 10012,
        BATTERY_STATUS: 10050,
        BATTERY_LEVEL: 10051,
        BATTERY_PLUGGED_SOURCE: 10052,
        BATTERY_TEMPERATURE: 10053,
        BATTERY_HEALTH: 10054,
        BATTERY_PRESENT: 10055,
        BATTERY_CURRENT: 10056,
        BATTERY_CHARGE_COUNTER: 10057,
        BATTERY_ENERGY_COUNTER: 10058,
        BATTERY_EXTRA_LEVEL_AND_SCALE: 10059,
        BATTERY_TECHNOLOGY: 10060,
        BATTERY_VOLTAGE: 10061,
        BATTERY_LOW: 10062,
        DISPLAY_SIZE: 10100,
        DISPLAY_PPI: 10101,
        DISPLAY_DENSITY: 10102,
        DISPLAY_DENSITY_DPI: 10103,
        DISPLAY_SCALED_DENSITY: 10104,
        DISPLAY_BRIGHTNESS: 10105,
        IS_SCREEN_CAPTURED: 10106,
        DISPLAY_REAL_SIZE: 10107,
        APP_FIRST_INSTALL_TIME: 10200,
        APP_LAST_UPDATE_TIME: 10201,
        APP_VERSION_CODE: 10202,
        APP_VERSION_NAME: 10203,
        APP_PACKAGE_NAME: 10204,
        APP_BASE_REVISION_CODE: 10205,
        APP_ACTIVITIES: 10206,
        APP_ACTIVITIES_COUNT: 10207,
        APP_ACTIVITIES_SHA256: 10208,
        APP_SERVICES: 10209,
        APP_SERVICES_COUNT: 10210,
        APP_SERVICES_SHA256: 10211,
        APP_REQUESTED_PERMISSIONS: 10212,
        APP_REQUESTED_PERMISSIONS_COUNT: 10213,
        APP_REQUESTED_PERMISSIONS_SHA256: 10214,
        BUILD_CONFIG: 10250,
        DEVICE_FEATURES: 10300,
        APP_INSTALLER_PACKAGE_NAME: 10500,
        IS_SAFE_MODE: 10501,
        INSTALL_REASON: 10502,
        CAN_REQUEST_PACKAGE_INSTALLS: 10503,
        INSTANT_APP_COOKIE: 10504,
        APP_CONTENT_PROVIDERS: 10505,
        ALL_INSTALLED_PACKAGES: 10506,
        SYSTEM_INSTALLED_PACKAGES: 10507,
        UNINSTALLED_PACKAGES: 10508,
        PACKAGE_COMPONENTS_ENABLED: 10550,
        BUILD_BOARD: 10600,
        BUILD_BOOTLOADER: 10601,
        BUILD_BRAND: 10602,
        BUILD_DEVICE: 10603,
        BUILD_DISPLAY: 10604,
        BUILD_FINGERPRINT: 10605,
        BUILD_HARDWARE: 10606,
        BUILD_HOST: 10607,
        BUILD_ID: 10608,
        BUILD_MANUFACTURER: 10609,
        BUILD_MODEL: 10610,
        BUILD_PRODUCT: 10611,
        BUILD_RADIO_VERSION: 10612,
        BUILD_SERIAL: 10613,
        BUILD_SUPPORTED_ABIS: 10614,
        BUILD_TAGS: 10615,
        BUILD_TIME: 10616,
        BUILD_TYPE: 10617,
        BUILD_USER: 10618,
        IS_BUILD_CONSISTENT: 10619,
        BUILD_VERSION_CODENAME: 10650,
        BUILD_VERSION_RELEASE: 10651,
        BUILD_VERSION_SDK_INT: 10652,
        BUILD_VERSION_SECURITY_PATCH: 10653,
        BUILD_VERSION_BASE_OS: 10654,
        MOBILE_RX_BYTES: 10700,
        MOBILE_TX_BYTES: 10701,
        TOTAL_RX_BYTES: 10702,
        TOTAL_TX_BYTES: 10703,
        ANDROID_TOUCH_EVENT: 10800,
        ANDROID_TAP_GESTURE: 10801,
        ANDROID_FLING_GESTURE: 10802,
        ANDROID_SCROLL_GESTURE: 10803,
        ACCELEROMETER_SENSOR: 10810,
        GYROSCOPE_SENSOR: 10811,
        MAGNETOMETER_SENSOR: 10812,
        GEOMAGNETIC_ROTATION_SENSOR: 10813,
        ORIENTATION_SENSOR: 10814,
        PROXIMITY_SENSOR: 10815,
        STEP_DETECTOR_SENSOR: 10816,
        LIGHT_SENSOR: 10817,
        BAROMETER_SENSOR: 10818,
        AMBIENT_TEMPERATURE_SENSOR: 10819,
        RELATIVE_HUMIDITY_SENSOR: 10820,
        KEY_PRESS: 10850,
        DEVICE_TOTAL_MEMORY: 10880,
        CONFIGURATION_INFO_OPENGL_ES_VERSION: 10881,
        CONFIGURATION_INFO_INPUT_FEATURES: 10882,
        CONFIGURATION_INFO_KEYBOARD_TYPE: 10883,
        CONFIGURATION_INFO_NAVIGATION: 10884,
        CONFIGURATION_INFO_TOUCH_SCREEN: 10885,
        APP_PROCESS_INFO_IMPORTANCE: 10886,
        APP_PROCESS_PROCESS_NAME: 10887,
        IS_RUNNING_IN_TEST_HARNESS: 10888,
        IS_USER_A_MONKEY: 10889,
        LOCK_TASK_MODE_STATE: 10890,
        APP_INFO_FLAGS: 10900,
        APP_INFO_MIN_SDK_VERSION: 10901,
        APP_INFO_TARGET_SDK_VERSION: 10902,
        APP_INFO_SOURCE_DIR: 10903,
        APP_INFO_DATA_DIR: 10904,
        APP_INFO_NATIVE_LIBRARY_DIR: 10905,
        APP_INFO_PUBLIC_SOURCE_DIR: 10906,
        APP_INFO_DEVICE_PROTECTED_DATA_DIR: 10907,
        APP_INFO_PROCESS_NAME: 10908,
        APP_INFO_TASK_AFFINITY: 10909,
        APP_INFO_THEME: 10910,
        APP_INFO_CATEGORY: 10911,
        AUDIO_STREAMS_VOLUME: 10920,
        IS_MICROPHONE_MUTE: 10930,
        IS_MUSIC_ACTIVE: 10931,
        IS_SPEAKERPHONE_ON: 10932,
        IS_WIRED_HEADSET_ON_DEPRECATED: 10933,
        AUDIO_RINGER_MODE: 10934,
        AUDIO_DEVICES: 10935,
        SYSTEM_PROPERTIES: 10940,
        FILES_INFO: 10941,
        FILES_GREP: 10942,
        SETTINGS_GLOBAL: 10943,
        SETTINGS_SECURE: 10944,
        SETTINGS_SYSTEM: 10945,
        NETWORK_CAPABILITIES: 10946,
        TRANSPORT_CAPABILITIES: 10947,
        LINK_DOWNSTREAM_BANDWIDTH_KBPS: 10948,
        LINK_UPSTREAM_BANDWIDTH_KBPS: 10949,
        USB_MANAGER_ACTION_USB_STATE: 10950,
        USB_MANAGER_ACTION_USB_ACCESSORY: 10951,
        USB_MANAGER_ACTION_USB_DEVICE: 10952,
        BLUETOOTH_ADAPTER_ADDRESS: 10970,
        BLUETOOTH_ADAPTER_NAME: 10971,
        BLUETOOTH_PAIRED_DEVICES: 10972,
        IS_DEVICE_LOCKED: 10980,
        IS_DEVICE_SECURE: 10981,
        IS_KEYGUARD_LOCKED: 10982,
        IS_KEYGUARD_SECURE: 10983,
        IS_INTERACTIVE: 10990,
        IS_DEVICE_IDLE_MODE: 10991,
        IS_POWER_SAVE_MODE: 10992,
        SENSORS_LIST: 11e3,
        SYSTEM_ELAPSED_TIME: 11010,
        SYSTEM_UP_TIME: 11011,
        TIME_ZONE_ID: 11020,
        TIME_ZONE_RAW_OFFSET: 11021,
        TIME_ZONE_DISPLAY_NAME: 11022,
        LOCALE_LANGUAGE: 11030,
        LOCALE_COUNTRY: 11031,
        LOCALE_SCRIPT: 11032,
        LOCALE_VARIANT: 11033,
        JVM_RUNTIME_TOTAL_MEMORY: 11040,
        JVM_RUNTIME_AVAILABLE_PROCESSORS: 11041,
        TELEPHONY_DATA_NETWORK_TYPE: 11050,
        TELEPHONY_VOICE_NETWORK_TYPE: 11051,
        TELEPHONY_PHONE_TYPE: 11052,
        TELEPHONY_PHONE_COUNT: 11053,
        TELEPHONY_NETWORK_OPERATOR: 11054,
        TELEPHONY_NETWORK_OPERATOR_NAME: 11055,
        TELEPHONY_SIM_OPERATOR: 11056,
        TELEPHONY_SIM_OPERATOR_NAME: 11057,
        TELEPHONY_SIM_CARRIER_ID: 11058,
        TELEPHONY_SIM_COUNTRY_ISO: 11059,
        TELEPHONY_SIM_STATE: 11060,
        TELEPHONY_SIGNAL_STRENGTH_LEVEL: 11061,
        IS_MOBILE_DATA_ENABLED: 11062,
        WIFI_SSID: 11090,
        WIFI_BSSID: 11091,
        CAPTURE_DEVICES: 2e4,
        AUDIO_INPUT_PORTS: 20001,
        AUDIO_OUTPUT_PORTS: 20002,
        IS_OTHER_AUDIO_PLAYING: 20003,
        IS_SECONDARY_AUDIO_SHOULD_BE_SILENCED_HINT: 20004,
        SYSTEM_INFO: 20005,
        DEVICE_NAME: 20006,
        DEVICE_SYSTEM_NAME: 20007,
        DEVICE_SYSTEM_VERSION: 20008,
        DEVICE_MODEL: 20009,
        DEVICE_IDENTIFIER_FOR_VENDOR: 20010,
        DEVICE_ORIENTATION: 20020,
        DEVICE_BATTERY_MONITORING_ENABLED: 20030,
        DEVICE_BATTERY_STATE: 20031,
        DEVICE_BATTERY_LEVEL: 20032,
        DEVICE_PROXIMITY_MONITORING_ENABLED: 20040,
        DEVICE_PROXIMITY_STATE: 20041,
        PROCESS_ENVIRONMENT_VARS: 20050,
        PROCESS_ENVIRONMENT_VARS_COUNT: 20051,
        PROCESS_ENVIRONMENT_VARS_SHA256: 20052,
        PROCESS_ARGUMENTS: 20053,
        PROCESS_ID: 20054,
        PROCESS_NAME: 20055,
        PROCESS_HOST_NAME: 20056,
        PROCESS_OPERATING_SYSTEM_VERSION: 20057,
        PROCESS_OPERATING_SYSTEM_VERSION_STRING: 20058,
        PROCESS_PROCESSOR_COUNT: 20059,
        PROCESS_ACTIVE_PROCESSOR_COUNT: 20060,
        PROCESS_PHYSICAL_MEMORY: 20061,
        PROCESS_THERMAL_STATE: 20062,
        PROCESS_LOW_POWER_MODE_ENABLED: 20063,
        IS_TARGET_OS_SIMULATOR: 20070,
        IS_APP_BUNDLE_APP_STORE_SIGNED: 20071,
        APP_RUNTIME_STATE: 20080,
        IS_APP_IDLE_TIMER_DISABLED: 20081,
        IS_PROTECTED_DATA_AVAILABLE: 20082,
        IS_IGNORING_INTERACTION_EVENTS: 20083,
        APP_ICON_BADGE_NUMBER: 20084,
        BUNDLE_INFO_DICTIONARY: 20090,
        BUNDLE_INFO_DICTIONARY_COUNT: 20091,
        BUNDLE_INFO_DICTIONARY_SHA256: 20092,
        IOS_TOUCH_EVENT: 20100,
        IOS_TAP_GESTURE: 20101,
        IOS_SWIPE_GESTURE: 20102,
        IOS_PAN_GESTURE: 20103,
        IOS_LOCALE_IDENTIFIER: 20110,
        IOS_LOCALE_LANGUAGE_CODE: 20111,
        IOS_LOCALE_CALENDAR_IDENTIFIER: 20112,
        IOS_LOCALE_COUNTRY_CODE: 20113,
        TELEPHONY_CARRIER_NAME: 20120,
        TELEPHONY_ISO_COUNTRY_CODE: 20121,
        TELEPHONY_MOBILE_COUNTRY_CODE: 20122,
        TELEPHONY_MOBILE_NETWORK_CODE: 20123,
        IS_CARRIER_ALLOWS_VOIP: 20124,
        CELLULAR_DATA_ACCESS_RESTRICTED_STATE: 20125,
        IS_STEP_COUNTING_AVAILABLE: 20130,
        IS_DISTANCE_AVAILABLE: 20131,
        IS_FLOOR_COUNTING_AVAILABLE: 20132,
        IS_PACE_AVAILABLE: 20133,
        IS_CADENCE_AVAILABLE: 20134,
        IS_PEDOMETER_EVENT_TRACKING_AVAILABLE: 20135,
        IS_DEVICE_MOTION_AVAILABLE: 20140,
        IS_ACCELEROMETER_AVAILABLE: 20141,
        IS_GYRO_AVAILABLE: 20142,
        IS_MAGNETOMETER_AVAILABLE: 20143,
        IS_RELATIVE_ALTITUDE_AVAILABLE: 20150,
        IOS_PROXY_SETTINGS: 20160,
        IOS_NETWORK_INFO_DEPRECATED: 20170,
        IOS_NETWORK_INFO: 20171,
        LA_CONTEXT_CAN_EVALUATE_POLICIES: 20180,
        LA_CONTEXT_BIOMETRY_TYPE: 20181,
        LA_CONTEXT_TOUCH_ID_AUTHENTICATION_REUSE_DURATION: 20182,
        LA_CONTEXT_IS_CREDENTIAL_SET: 20183,
        IS_JAILBROKEN: 20190,
        IOS_FILES_INFO: 20191,
        IS_JAILBROKEN_INTERNAL: 20192,
        WEBDRIVER: 3e4,
        PLUGIN_COUNT: 30001,
        MIME_TYPE_COUNT: 30002,
        LANGUAGES: 30003,
        CONNECTION_RTT: 30004,
        WINDOW_OUTER_DIMENSION: 30005,
        WINDOW_CHROME: 30006,
        NOTIFICATION_PERMISSION: 30007,
        NAVIGATOR_NOTIFICATION_PERMISSION: 30008,
        FONTS: 30009,
        JS_FINGERPRINT: 30010,
        IS_DEV_TOOLS_OPEN: 30011,
        NAVIGATOR_VENDOR: 30012,
        NAVIGATOR_APP_VERSION: 30013,
        NAVIGATOR_ONLINE: 30014,
        NAVIGATOR_PLATFORM: 30015,
        NAVIGATOR_DO_NOT_TRACK: 30016,
        NAVIGATOR_PRODUCT_SUB: 30017,
        NAVIGATOR_HARDWARE_CONCURRENCY: 30018,
        NAVIGATOR_PROPERTIES_COUNT: 30039,
        TIMEZONE_OFFSET: 30040,
        WINDOW_SCREEN_TOP: 30050,
        ALERT_TO_STRING_MD5: 30090,
        CONFIRM_TO_STRING_MD5: 30091,
        PROMPT_TO_STRING_MD5: 30092,
        KEY_DOWN_UP: 30100,
        MOUSE_POSITION: 30101,
        MOUSE_DOWN_UP: 30102,
        MOUSE_CLICK: 30103,
        SCROLL_POSITION: 30104,
        TYPING_INTERVAL: 30105,
        ADVERTISING_ID: 37263,
        HEARTBEAT: 38e3,
        HEARTBEAT_V2: 38001
    })
}, 19136523, []);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    let t = null;
    const n = {
        signalType: r(d[2]).PLUGIN_COUNT,
        get: () => (null == t && (t = new class extends(r(d[1])) {
            constructor() {
                super(n.signalType)
            }
            executeSignalCollection() {
                this.throwIfNotInitialized();
                const t = navigator.plugins ? navigator.plugins.length : -1;
                return {
                    valueOrError: new(r(d[0]))(Date.now(), this.getContext(), t)
                }
            }
        }), t)
    };
    m.exports = n
}, 19136530, [19136549, 19136540, 19136523]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    m.exports = class extends r(d[0]).SignalValueTypeDef {
        constructor(s, t, c) {
            super(s, t, c, r(d[0]).VALUE_TYPES.NUMBER)
        }
    }
}, 19136549, [19136541]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    let t = null;
    const n = {
        signalType: r(d[2]).MIME_TYPE_COUNT,
        get: () => (null == t && (t = new class extends(r(d[1])) {
            constructor() {
                super(n.signalType)
            }
            executeSignalCollection() {
                this.throwIfNotInitialized();
                const t = navigator.mimeTypes ? navigator.mimeTypes.length : -1;
                return {
                    valueOrError: new(r(d[0]))(Date.now(), this.getContext(), t)
                }
            }
        }), t)
    };
    m.exports = n
}, 19136531, [19136549, 19136540, 19136523]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    let t = null;
    const n = {
        signalType: r(d[3]).LANGUAGES,
        get: () => (null == t && (t = new class extends(r(d[2])) {
            constructor() {
                super(n.signalType)
            }
            executeSignalCollection() {
                this.throwIfNotInitialized();
                const t = [].concat(navigator.languages);
                return {
                    valueOrError: new(r(d[0]))(Date.now(), this.getContext(), new(r(d[1]))(t))
                }
            }
        }), t)
    };
    m.exports = n
}, 19136532, [19136550, 19136551, 19136540, 19136523]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    m.exports = class extends r(d[0]).SignalValueTypeDef {
        constructor(t, l, u) {
            super(t, l, u, r(d[0]).VALUE_TYPES.CUSTOM_OBJECT)
        }
        equalValue(t) {
            return this.getSignalValue().isEqual(t.getSignalValue())
        }
        addValueOrErrorToJSON(t) {
            t[r(d[0]).BD_VALUE] = this.getSignalValue().toJSON()
        }
    }
}, 19136550, [19136541]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    class s {
        constructor(s) {
            this.strings = [], this.strings = s
        }
        toJSON() {
            return this.strings
        }
        isEqual(t) {
            if (!(t instanceof s)) return !1;
            if (t.strings === this.strings) return !0;
            if (t.strings.length !== this.strings.length) return !1;
            for (let s = 0; s < this.strings.length; s++)
                if (this.strings[s] !== t.strings[s]) return !1;
            return !0
        }
    }
    m.exports = s
}, 19136551, []);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    let t = null;
    const n = {
        signalType: r(d[5]).CONNECTION_RTT,
        get: () => (null == t && (t = new class extends(r(d[4])) {
            constructor() {
                super(n.signalType)
            }
            executeSignalCollection() {
                var t;
                this.throwIfNotInitialized();
                let n;
                if (null != (null === (t = navigator.connection) || void 0 === t ? void 0 : t.rtt)) {
                    const t = navigator.connection.rtt;
                    n = new(r(d[0]))(Date.now(), this.getContext(), t)
                } else n = new(r(d[1]))(Date.now(), this.getContext(), new(r(d[2]).SignalErrorValueTypeDef)(r(d[3]).NOT_SUPPORTED, 'navigator.connection.rtt not supported'));
                return {
                    valueOrError: n
                }
            }
        }), t)
    };
    m.exports = n
}, 19136533, [19136549, 19136552, 19136542, 19136543, 19136540, 19136523]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    m.exports = class extends r(d[0]).SignalValueTypeDef {
        constructor(t, l, u) {
            super(t, l, u, r(d[0]).VALUE_TYPES.ERROR)
        }
        equalValue(t) {
            return this.getSignalValue().isEqual(t.getSignalValue())
        }
        addValueOrErrorToJSON(t) {
            t[r(d[0]).BD_ERROR] = this.getSignalValue().toJSON()
        }
    }
}, 19136552, [19136541]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    let t = null;
    const n = {
        signalType: r(d[3]).WINDOW_OUTER_DIMENSION,
        get: () => (null == t && (t = new class extends(r(d[2])) {
            constructor() {
                super(n.signalType)
            }
            executeSignalCollection() {
                this.throwIfNotInitialized();
                const t = window.outerHeight,
                    n = window.outerWidth;
                return {
                    valueOrError: new(r(d[0]))(Date.now(), this.getContext(), new(r(d[1]))(n, t))
                }
            }
        }), t)
    };
    m.exports = n
}, 19136534, [19136550, 19136553, 19136540, 19136523]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    class t {
        constructor(t, h) {
            this.width = null, this.height = null, this.width = t, this.height = h
        }
        toJSON() {
            return {
                w: this.width,
                h: this.height
            }
        }
        isEqual(h) {
            return h instanceof t && (this.width === h.width && this.height === h.height)
        }
    }
    m.exports = t
}, 19136553, []);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    let t = null;
    const n = {
        signalType: r(d[5]).NOTIFICATION_PERMISSION,
        get: () => (null == t && (t = new class extends(r(d[4])) {
            constructor() {
                super(n.signalType)
            }
            executeSignalCollection() {
                this.throwIfNotInitialized();
                let t;
                return t = window.Notification ? new(r(d[0]))(Date.now(), this.getContext(), Notification.permission) : new(r(d[1]))(Date.now(), this.getContext(), new(r(d[2]).SignalErrorValueTypeDef)(r(d[3]).NOT_SUPPORTED, 'Notification not supported')), {
                    valueOrError: t
                }
            }
        }), t)
    };
    m.exports = n
}, 19136535, [19136554, 19136552, 19136542, 19136543, 19136540, 19136523]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    m.exports = class extends r(d[0]).SignalValueTypeDef {
        constructor(s, t, c) {
            super(s, t, c, r(d[0]).VALUE_TYPES.STRING)
        }
    }
}, 19136554, [19136541]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    let t = null;
    const n = {
        signalType: r(d[2]).NAVIGATOR_VENDOR,
        get: () => (null == t && (t = new class extends(r(d[1])) {
            constructor() {
                super(n.signalType)
            }
            executeSignalCollection() {
                this.throwIfNotInitialized();
                const t = navigator.vendor;
                return {
                    valueOrError: new(r(d[0]))(Date.now(), this.getContext(), t)
                }
            }
        }), t)
    };
    m.exports = n
}, 19136536, [19136554, 19136540, 19136523]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    let t = null;
    const n = {
        signalType: r(d[2]).NAVIGATOR_PLATFORM,
        get: () => (null == t && (t = new class extends(r(d[1])) {
            constructor() {
                super(n.signalType)
            }
            executeSignalCollection() {
                return this.throwIfNotInitialized(), {
                    valueOrError: new(r(d[0]))(Date.now(), this.getContext(), navigator.platform)
                }
            }
        }), t)
    };
    m.exports = n
}, 19136537, [19136554, 19136540, 19136523]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    let t = null;
    const n = {
        signalType: r(d[4]).HEARTBEAT_V2,
        get: () => (null == t && (t = new class extends(r(d[3])) {
            constructor() {
                super(n.signalType)
            }
            executeSignalCollection() {
                return {
                    valueOrError: new(r(d[0]))(Date.now(), this.getContext(), new(r(d[1]))(i(d[2]).get().getHeartbeatVersion()))
                }
            }
        }), t)
    };
    m.exports = n
}, 19136538, [19136550, 19136555, 19136515, 19136540, 19136523]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    m.exports = class extends(r(d[0])) {
        constructor(s) {
            super(), this.id = '', this.id = s
        }
        toJSON() {
            return {
                f: this.isAppForeground,
                id: this.id
            }
        }
    }
}, 19136555, [19136556]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    m.exports = class {
        constructor() {
            this.isAppForeground = !0
        }
        toJSON() {
            return {
                f: this.isAppForeground
            }
        }
        isEqual(s) {
            return !1
        }
    }
}, 19136556, []);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    const {
        OPERATIONS: t
    } = r(d[0]), s = {
        parseConfig(s) {
            const n = [];
            try {
                const o = s.sc,
                    c = new Map(o.c);
                if (c.forEach((t, s) => n.push(new(r(d[1]))(s, t))), 0 === c.size) return void r(d[2]).logError("BDServerConfig", t.EMPTY_SIGNAL_CONFIG);
                r(d[3]).get().setClientReputationTier(s.rt).addMultipleSignalsToClientConfig(n).setPeriodicCollectionIntervalSeconds(s.i).setConfigGenerationTimeStamp(o.t).setAllTiersFlushDurationMinutes(s.fd).setHeartbeatIntervalMinutes(s.hbc.hbi).setStaticSignalBufferSize(s.sbs).setDynamicSignalBufferSize(s.dbs).setBiometricSignalBufferSize(s.bbs).setSID(s.sid).setHeartbeatVersion(s.hbc.hbv).setParsingDone(!0)
            } catch (s) {
                r(d[2]).logError("BDServerConfig", t.PARSE_CONFIG_ERROR, {
                    e: s
                })
            }
        }
    };
    m.exports = s
}, 19136516, [19136513, 19136557, 19136517, 19136515]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    const {
        OPERATIONS: s
    } = r(d[0]), t = 'BDServerSignalConfig';
    m.exports = class {
        constructor(s, t, l) {
            this.parsedSignalFlags = [], this.signalId = s, this.signalFlags = t, this.bufferSize = l
        }
        getSignalId() {
            return this.signalId
        }
        getSignalFlags() {
            return 0 === this.parsedSignalFlags.length && Object.keys(r(d[1])).forEach(s => {
                (r(d[1])[s] & this.signalFlags) === r(d[1])[s] && this.parsedSignalFlags.push(r(d[1])[s])
            }), 0 === this.parsedSignalFlags.length && r(d[2]).logError(t, s.SIGNAL_FLAGS_MISSING, {
                id: this.signalId.toString(),
                flags: this.signalFlags.toString()
            }), this.parsedSignalFlags
        }
        getBufferSize() {
            return null != this.bufferSize ? this.bufferSize : 0
        }
    }
}, 19136557, [19136513, 19136526, 19136517]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    const t = Object.freeze({
        STATIC: 0,
        DYNAMIC: 1,
        BIOMETRIC: 2
    });
    m.exports = t
}, 19136519, []);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    const {
        OPERATIONS: t
    } = r(d[0]), n = 'BDSignalBuffer', l = {
        initialize(t, n, l) {
            var s;
            if (t in r(d[1])) return;
            let o = 1;
            void 0 !== n && (o = n), r(d[1])[t] = {
                values: [],
                max_buffer_size: o,
                signal_flags: null !== (s = l) && void 0 !== s ? s : []
            }
        },
        clearBuffer(t) {
            if (!(t in r(d[1]))) throw new Error('Tried to clear signal buffer that was not intialized:');
            r(d[1])[t].values = []
        },
        appendSignal(l, s) {
            if (!(l in r(d[1]))) throw r(d[3]).logError(n, t.APPEND_SIGNAL_FAIL, {
                id: l.toString()
            }), new Error('Tried to append signal that was not intialized:'); {
                const o = r(d[1])[l],
                    u = o.max_buffer_size;
                o.values.length >= u && (o.signal_flags.includes(r(d[2]).BIOMETRIC) || o.values.shift()), o.values.push(s), r(d[3]).logInfo(n, t.APPEND_SIGNAL, {
                    id: l.toString()
                })
            }
        },
        clearBiometricSignals() {
            r(d[4]).get().getBiometricSignals().forEach(t => {
                t.signalType in r(d[1]) && l.clearBuffer(t.signalType)
            })
        },
        getLastSignalFormatBySignalId(t) {
            var n;
            const l = r(d[1])[t],
                s = null === l || void 0 === l ? void 0 : null === (n = l.values) || void 0 === n ? void 0 : n.length;
            return null != s && s > 0 ? l.values[s - 1] : {
                valueOrError: void 0
            }
        },
        retrieveSignal: t => r(d[1])[t].values,
        retrieveSignals(t) {
            const n = {};
            for (const l of t) l in r(d[1]) && (n[l] = this.retrieveSignal(l).map(t => t.valueOrError));
            return n
        },
        getSignalsAsJSONString(t) {
            const n = this._getSignalIdsByCollectionType(t);
            return JSON.stringify(this.retrieveSignals(n))
        },
        _getSignalIdsByCollectionType(t) {
            const n = r(d[4]).get();
            let l = [];
            return t.forEach(t => {
                switch (t) {
                    case r(d[5]).STATIC:
                        l = [...l, ...n.getStaticSignals()];
                        break;
                    case r(d[5]).DYNAMIC:
                        l = [...l, ...n.getDynamicSignals()];
                        break;
                    case r(d[5]).BIOMETRIC:
                        l = [...l, ...n.getBiometricSignals()]
                }
            }), l.map(t => t.signalType)
        }
    };
    m.exports = l
}, 19136520, [19136513, 19136528, 19136526, 19136517, 19136515, 19136519]);
__d(function(g, r, i, a, m, e, d) {
    "use strict";
    Object.defineProperty(e, '__esModule', {
        value: !0
    });
    const o = {
        falco: !0,
        pigeon: !1
    };
    e.default = class {
        static log(c) {
            r(d[0]).FalcoLogger.log('bd_pdc_signals', c(), {}, o)
        }
    }
}, 19136521, [9764876]);
__d(function(g, r, i, a, m, e, d) {
    var t = function(o, h) {
        this.key = o, "ecb" !== h && "cbc" !== h || (this.mode = h), this.sBox0 = t.sBox0.slice(), this.sBox1 = t.sBox1.slice(), this.sBox2 = t.sBox2.slice(), this.sBox3 = t.sBox3.slice(), this.pArray = t.pArray.slice(), this.generateSubkeys(o)
    };
    t.prototype = {
        sBox0: null,
        sBox1: null,
        sBox2: null,
        sBox3: null,
        pArray: null,
        key: null,
        mode: "ecb",
        iv: "abc12345",
        keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encrypt: function(t, o) {
            if ("ecb" === this.mode) return this.encryptECB(t);
            if ("cbc" === this.mode) return this.encryptCBC(t, o);
            throw new Error("Неизвестный режим шифрования.")
        },
        decrypt: function(t, o) {
            if ("ecb" === this.mode) return this.decryptECB(t);
            if ("cbc" === this.mode) return this.decryptCBC(t, o);
            throw new Error("Неизвестный режим шифрования.")
        },
        encryptECB: function(t) {
            t = this.utf8Decode(t);
            for (var o = Math.ceil(t.length / 8), h = "", s = 0; s < o; s++) {
                var n = t.substr(8 * s, 8);
                if (n.length < 8)
                    for (var c = 8 - n.length; 0 < c--;) n += "\0";
                var f, u, l = this.split64by32(n);
                f = l[0], u = l[1], f = (l = this.encipher(f, u))[0], u = l[1], h += this.num2block32(f) + this.num2block32(u)
            }
            return h
        },
        encryptCBC: function(t, o) {
            t = this.utf8Decode(t);
            var h, s, n, c = Math.ceil(t.length / 8);
            h = (n = this.split64by32(o))[0], s = n[1];
            for (var f = "", u = 0; u < c; u++) {
                var l = t.substr(8 * u, 8);
                if (l.length < 8)
                    for (var C = 8 - l.length; 0 < C--;) l += "\0";
                var x, p, y;
                x = (y = this.split64by32(l))[0], p = y[1], x = this.xor(x, h), p = this.xor(p, s), h = x = (y = this.encipher(x, p))[0], s = p = y[1], f += this.num2block32(x) + this.num2block32(p)
            }
            return f
        },
        decryptECB: function(t) {
            for (var o = Math.ceil(t.length / 8), h = "", s = 0; s < o; s++) {
                var n = t.substr(8 * s, 8);
                if (n.length < 8) throw new Error("Зашифрованная строка повреждена: длинна зашифрованной строки должна быть кратна 8 баыйтам.");
                var c, f, u;
                c = (u = this.split64by32(n))[0], f = u[1], c = (u = this.decipher(c, f))[0], f = u[1], h += this.num2block32(c) + this.num2block32(f)
            }
            return h = this.utf8Encode(h)
        },
        decryptCBC: function(t, o) {
            var h, s, n, c, f, u = Math.ceil(t.length / 8);
            h = (f = this.split64by32(o))[0], s = f[1];
            for (var l = "", C = 0; C < u; C++) {
                var x = t.substr(8 * C, 8);
                if (x.length < 8) throw new Error("Зашифрованная строка повреждена: длинна зашифрованной строки должна быть кратна 8 байтам.");
                var p, y, b;
                n = p = (b = this.split64by32(x))[0], c = y = b[1], p = (b = this.decipher(p, y))[0], y = b[1], p = this.xor(p, h), y = this.xor(y, s), h = n, s = c, l += this.num2block32(p) + this.num2block32(y)
            }
            return l = this.utf8Encode(l)
        },
        F: function(t) {
            var o = t >>> 24,
                h = t << 8 >>> 24,
                s = t << 16 >>> 24,
                n = t << 24 >>> 24,
                c = this.addMod32(this.sBox0[o], this.sBox1[h]);
            return c = this.xor(c, this.sBox2[s]), c = this.addMod32(c, this.sBox3[n])
        },
        encipher: function(t, o) {
            for (var h, s = 0; s < 16; s++) h = t = this.xor(t, this.pArray[s]), t = o = this.xor(this.F(t), o), o = h;
            return h = t, t = o, o = h, o = this.xor(o, this.pArray[16]), t = this.xor(t, this.pArray[17]), [t, o]
        },
        decipher: function(t, o) {
            var h;
            h = t = this.xor(t, this.pArray[17]), t = o = this.xor(o, this.pArray[16]), o = h;
            for (var s = 15; s >= 0; s--) h = t, t = o, o = h, o = this.xor(this.F(t), o), t = this.xor(t, this.pArray[s]);
            return [t, o]
        },
        generateSubkeys: function(t) {
            var o, h, s = 0,
                n = 0;
            for (o = 0; o < 18; o++) {
                for (h = 4; h > 0; h--) s = this.fixNegative(s << 8 | t.charCodeAt(n)), n = (n + 1) % t.length;
                this.pArray[o] = this.xor(this.pArray[o], s), s = 0
            }
            var c = [0, 0];
            for (o = 0; o < 18; o += 2) c = this.encipher(c[0], c[1]), this.pArray[o] = c[0], this.pArray[o + 1] = c[1];
            for (o = 0; o < 256; o += 2) c = this.encipher(c[0], c[1]), this.sBox0[o] = c[0], this.sBox0[o + 1] = c[1];
            for (o = 0; o < 256; o += 2) c = this.encipher(c[0], c[1]), this.sBox1[o] = c[0], this.sBox1[o + 1] = c[1];
            for (o = 0; o < 256; o += 2) c = this.encipher(c[0], c[1]), this.sBox2[o] = c[0], this.sBox2[o + 1] = c[1];
            for (o = 0; o < 256; o += 2) c = this.encipher(c[0], c[1]), this.sBox3[o] = c[0], this.sBox3[o + 1] = c[1]
        },
        block32toNum: function(t) {
            return this.fixNegative(t.charCodeAt(0) << 24 | t.charCodeAt(1) << 16 | t.charCodeAt(2) << 8 | t.charCodeAt(3))
        },
        num2block32: function(t) {
            return String.fromCharCode(t >>> 24) + String.fromCharCode(t << 8 >>> 24) + String.fromCharCode(t << 16 >>> 24) + String.fromCharCode(t << 24 >>> 24)
        },
        xor: function(t, o) {
            return this.fixNegative(t ^ o)
        },
        addMod32: function(t, o) {
            return this.fixNegative(t + o | 0)
        },
        fixNegative: function(t) {
            return t >>> 0
        },
        split64by32: function(t) {
            var o = t.substring(0, 4),
                h = t.substring(4, 8);
            return [this.block32toNum(o), this.block32toNum(h)]
        },
        utf8Decode: function(t) {
            for (var o = "", h = 0; h < t.length; h++) {
                var s = t.charCodeAt(h);
                s < 128 ? o += String.fromCharCode(s) : s > 127 && s < 2048 ? (o += String.fromCharCode(s >> 6 | 192), o += String.fromCharCode(63 & s | 128)) : (o += String.fromCharCode(s >> 12 | 224), o += String.fromCharCode(s >> 6 & 63 | 128), o += String.fromCharCode(63 & s | 128))
            }
            return o
        },
        utf8Encode: function(t) {
            for (var o = "", h = 0, s = 0, n = 0, c = 0; h < t.length;)(s = t.charCodeAt(h)) < 128 ? (o += String.fromCharCode(s), h++) : s > 191 && s < 224 ? (n = t.charCodeAt(h + 1), o += String.fromCharCode((31 & s) << 6 | 63 & n), h += 2) : (n = t.charCodeAt(h + 1), c = t.charCodeAt(h + 2), o += String.fromCharCode((15 & s) << 12 | (63 & n) << 6 | 63 & c), h += 3);
            return o
        },
        base64Encode: function(t) {
            for (var o, h, s, n, c, f, u, l = "", C = 0; C < t.length;) n = (o = t.charCodeAt(C++)) >> 2, c = (3 & o) << 4 | (h = t.charCodeAt(C++)) >> 4, f = (15 & h) << 2 | (s = t.charCodeAt(C++)) >> 6, u = 63 & s, isNaN(h) ? f = u = 64 : isNaN(s) && (u = 64), l = l + this.keyStr.charAt(n) + this.keyStr.charAt(c) + this.keyStr.charAt(f) + this.keyStr.charAt(u);
            return l
        },
        base64Decode: function(t) {
            var o, h, s, n, c, f, u = "",
                l = 0;
            for (t = t.replace(/[^A-Za-z0-9\+\/\=]/g, ""); l < t.length;) o = this.keyStr.indexOf(t.charAt(l++)) << 2 | (n = this.keyStr.indexOf(t.charAt(l++))) >> 4, h = (15 & n) << 4 | (c = this.keyStr.indexOf(t.charAt(l++))) >> 2, s = (3 & c) << 6 | (f = this.keyStr.indexOf(t.charAt(l++))), u += String.fromCharCode(o), 64 != c && (u += String.fromCharCode(h)), 64 != f && (u += String.fromCharCode(s));
            return u
        },
        trimZeros: function(t) {
            return t.replace(/\0+$/g, "")
        }
    }, t.pArray = [608135816, 2242054355, 320440878, 57701188, 2752067618, 698298832, 137296536, 3964562569, 1160258022, 953160567, 3193202383, 887688300, 3232508343, 3380367581, 1065670069, 3041331479, 2450970073, 2306472731], t.sBox0 = [3509652390, 2564797868, 805139163, 3491422135, 3101798381, 1780907670, 3128725573, 4046225305, 614570311, 3012652279, 134345442, 2240740374, 1667834072, 1901547113, 2757295779, 4103290238, 227898511, 1921955416, 1904987480, 2182433518, 2069144605, 3260701109, 2620446009, 720527379, 3318853667, 677414384, 3393288472, 3101374703, 2390351024, 1614419982, 1822297739, 2954791486, 3608508353, 3174124327, 2024746970, 1432378464, 3864339955, 2857741204, 1464375394, 1676153920, 1439316330, 715854006, 3033291828, 289532110, 2706671279, 2087905683, 3018724369, 1668267050, 732546397, 1947742710, 3462151702, 2609353502, 2950085171, 1814351708, 2050118529, 680887927, 999245976, 1800124847, 3300911131, 1713906067, 1641548236, 4213287313, 1216130144, 1575780402, 4018429277, 3917837745, 3693486850, 3949271944, 596196993, 3549867205, 258830323, 2213823033, 772490370, 2760122372, 1774776394, 2652871518, 566650946, 4142492826, 1728879713, 2882767088, 1783734482, 3629395816, 2517608232, 2874225571, 1861159788, 326777828, 3124490320, 2130389656, 2716951837, 967770486, 1724537150, 2185432712, 2364442137, 1164943284, 2105845187, 998989502, 3765401048, 2244026483, 1075463327, 1455516326, 1322494562, 910128902, 469688178, 1117454909, 936433444, 3490320968, 3675253459, 1240580251, 122909385, 2157517691, 634681816, 4142456567, 3825094682, 3061402683, 2540495037, 79693498, 3249098678, 1084186820, 1583128258, 426386531, 1761308591, 1047286709, 322548459, 995290223, 1845252383, 2603652396, 3431023940, 2942221577, 3202600964, 3727903485, 1712269319, 422464435, 3234572375, 1170764815, 3523960633, 3117677531, 1434042557, 442511882, 3600875718, 1076654713, 1738483198, 4213154764, 2393238008, 3677496056, 1014306527, 4251020053, 793779912, 2902807211, 842905082, 4246964064, 1395751752, 1040244610, 2656851899, 3396308128, 445077038, 3742853595, 3577915638, 679411651, 2892444358, 2354009459, 1767581616, 3150600392, 3791627101, 3102740896, 284835224, 4246832056, 1258075500, 768725851, 2589189241, 3069724005, 3532540348, 1274779536, 3789419226, 2764799539, 1660621633, 3471099624, 4011903706, 913787905, 3497959166, 737222580, 2514213453, 2928710040, 3937242737, 1804850592, 3499020752, 2949064160, 2386320175, 2390070455, 2415321851, 4061277028, 2290661394, 2416832540, 1336762016, 1754252060, 3520065937, 3014181293, 791618072, 3188594551, 3933548030, 2332172193, 3852520463, 3043980520, 413987798, 3465142937, 3030929376, 4245938359, 2093235073, 3534596313, 375366246, 2157278981, 2479649556, 555357303, 3870105701, 2008414854, 3344188149, 4221384143, 3956125452, 2067696032, 3594591187, 2921233993, 2428461, 544322398, 577241275, 1471733935, 610547355, 4027169054, 1432588573, 1507829418, 2025931657, 3646575487, 545086370, 48609733, 2200306550, 1653985193, 298326376, 1316178497, 3007786442, 2064951626, 458293330, 2589141269, 3591329599, 3164325604, 727753846, 2179363840, 146436021, 1461446943, 4069977195, 705550613, 3059967265, 3887724982, 4281599278, 3313849956, 1404054877, 2845806497, 146425753, 1854211946], t.sBox1 = [1266315497, 3048417604, 3681880366, 3289982499, 290971e4, 1235738493, 2632868024, 2414719590, 3970600049, 1771706367, 1449415276, 3266420449, 422970021, 1963543593, 2690192192, 3826793022, 1062508698, 1531092325, 1804592342, 2583117782, 2714934279, 4024971509, 1294809318, 4028980673, 1289560198, 2221992742, 1669523910, 35572830, 157838143, 1052438473, 1016535060, 1802137761, 1753167236, 1386275462, 3080475397, 2857371447, 1040679964, 2145300060, 2390574316, 1461121720, 2956646967, 4031777805, 4028374788, 33600511, 2920084762, 1018524850, 629373528, 3691585981, 3515945977, 2091462646, 2486323059, 586499841, 988145025, 935516892, 3367335476, 2599673255, 2839830854, 265290510, 3972581182, 2759138881, 3795373465, 1005194799, 847297441, 406762289, 1314163512, 1332590856, 1866599683, 4127851711, 750260880, 613907577, 1450815602, 3165620655, 3734664991, 3650291728, 3012275730, 3704569646, 1427272223, 778793252, 1343938022, 2676280711, 2052605720, 1946737175, 3164576444, 3914038668, 3967478842, 3682934266, 1661551462, 3294938066, 4011595847, 840292616, 3712170807, 616741398, 312560963, 711312465, 1351876610, 322626781, 1910503582, 271666773, 2175563734, 1594956187, 70604529, 3617834859, 1007753275, 1495573769, 4069517037, 2549218298, 2663038764, 504708206, 2263041392, 3941167025, 2249088522, 1514023603, 1998579484, 1312622330, 694541497, 2582060303, 2151582166, 1382467621, 776784248, 2618340202, 3323268794, 2497899128, 2784771155, 503983604, 4076293799, 907881277, 423175695, 432175456, 1378068232, 4145222326, 3954048622, 3938656102, 3820766613, 2793130115, 2977904593, 26017576, 3274890735, 3194772133, 1700274565, 1756076034, 4006520079, 3677328699, 720338349, 1533947780, 354530856, 688349552, 3973924725, 1637815568, 332179504, 3949051286, 53804574, 2852348879, 3044236432, 1282449977, 3583942155, 3416972820, 4006381244, 1617046695, 2628476075, 3002303598, 1686838959, 431878346, 2686675385, 1700445008, 1080580658, 1009431731, 832498133, 3223435511, 2605976345, 2271191193, 2516031870, 1648197032, 4164389018, 2548247927, 300782431, 375919233, 238389289, 3353747414, 2531188641, 2019080857, 1475708069, 455242339, 2609103871, 448939670, 3451063019, 1395535956, 2413381860, 1841049896, 1491858159, 885456874, 4264095073, 4001119347, 1565136089, 3898914787, 1108368660, 540939232, 1173283510, 2745871338, 3681308437, 4207628240, 3343053890, 4016749493, 1699691293, 1103962373, 3625875870, 2256883143, 3830138730, 1031889488, 3479347698, 1535977030, 4236805024, 3251091107, 2132092099, 1774941330, 1199868427, 1452454533, 157007616, 2904115357, 342012276, 595725824, 1480756522, 206960106, 497939518, 591360097, 863170706, 2375253569, 3596610801, 1814182875, 2094937945, 3421402208, 1082520231, 3463918190, 2785509508, 435703966, 3908032597, 1641649973, 2842273706, 3305899714, 1510255612, 2148256476, 2655287854, 3276092548, 4258621189, 236887753, 3681803219, 274041037, 1734335097, 3815195456, 3317970021, 1899903192, 1026095262, 4050517792, 356393447, 2410691914, 3873677099, 3682840055], t.sBox2 = [3913112168, 2491498743, 4132185628, 2489919796, 1091903735, 1979897079, 3170134830, 3567386728, 3557303409, 857797738, 1136121015, 1342202287, 507115054, 2535736646, 337727348, 3213592640, 1301675037, 2528481711, 1895095763, 1721773893, 3216771564, 62756741, 2142006736, 835421444, 2531993523, 1442658625, 3659876326, 2882144922, 676362277, 1392781812, 170690266, 3921047035, 1759253602, 3611846912, 1745797284, 664899054, 1329594018, 3901205900, 3045908486, 2062866102, 2865634940, 3543621612, 3464012697, 1080764994, 553557557, 3656615353, 3996768171, 991055499, 499776247, 1265440854, 648242737, 3940784050, 980351604, 3713745714, 1749149687, 3396870395, 4211799374, 3640570775, 1161844396, 3125318951, 1431517754, 545492359, 4268468663, 3499529547, 1437099964, 2702547544, 3433638243, 2581715763, 2787789398, 1060185593, 1593081372, 2418618748, 4260947970, 69676912, 2159744348, 86519011, 2512459080, 3838209314, 1220612927, 3339683548, 133810670, 1090789135, 1078426020, 1569222167, 845107691, 3583754449, 4072456591, 1091646820, 628848692, 1613405280, 3757631651, 526609435, 236106946, 48312990, 2942717905, 3402727701, 1797494240, 859738849, 992217954, 4005476642, 2243076622, 3870952857, 3732016268, 765654824, 3490871365, 2511836413, 1685915746, 3888969200, 1414112111, 2273134842, 3281911079, 4080962846, 172450625, 2569994100, 980381355, 4109958455, 2819808352, 2716589560, 2568741196, 3681446669, 3329971472, 1835478071, 660984891, 3704678404, 4045999559, 3422617507, 3040415634, 1762651403, 1719377915, 3470491036, 2693910283, 3642056355, 3138596744, 1364962596, 2073328063, 1983633131, 926494387, 3423689081, 2150032023, 4096667949, 1749200295, 3328846651, 309677260, 2016342300, 1779581495, 3079819751, 111262694, 1274766160, 443224088, 298511866, 1025883608, 3806446537, 1145181785, 168956806, 3641502830, 3584813610, 1689216846, 3666258015, 3200248200, 1692713982, 2646376535, 4042768518, 1618508792, 1610833997, 3523052358, 4130873264, 2001055236, 3610705100, 2202168115, 4028541809, 2961195399, 1006657119, 2006996926, 3186142756, 1430667929, 3210227297, 1314452623, 4074634658, 4101304120, 2273951170, 1399257539, 3367210612, 3027628629, 1190975929, 2062231137, 2333990788, 2221543033, 2438960610, 1181637006, 548689776, 2362791313, 3372408396, 3104550113, 3145860560, 296247880, 1970579870, 3078560182, 3769228297, 1714227617, 3291629107, 3898220290, 166772364, 1251581989, 493813264, 448347421, 195405023, 2709975567, 677966185, 3703036547, 1463355134, 2715995803, 1338867538, 1343315457, 2802222074, 2684532164, 233230375, 2599980071, 2000651841, 3277868038, 1638401717, 4028070440, 3237316320, 6314154, 819756386, 300326615, 590932579, 1405279636, 3267499572, 3150704214, 2428286686, 3959192993, 3461946742, 1862657033, 1266418056, 963775037, 2089974820, 2263052895, 1917689273, 448879540, 3550394620, 3981727096, 150775221, 3627908307, 1303187396, 508620638, 2975983352, 2726630617, 1817252668, 1876281319, 1457606340, 908771278, 3720792119, 3617206836, 2455994898, 1729034894, 1080033504], t.sBox3 = [976866871, 3556439503, 2881648439, 1522871579, 1555064734, 1336096578, 3548522304, 2579274686, 3574697629, 3205460757, 3593280638, 3338716283, 3079412587, 564236357, 2993598910, 1781952180, 1464380207, 3163844217, 3332601554, 1699332808, 1393555694, 1183702653, 3581086237, 1288719814, 691649499, 2847557200, 2895455976, 3193889540, 2717570544, 1781354906, 1676643554, 2592534050, 3230253752, 1126444790, 2770207658, 2633158820, 2210423226, 2615765581, 2414155088, 3127139286, 673620729, 2805611233, 1269405062, 4015350505, 3341807571, 4149409754, 1057255273, 2012875353, 2162469141, 2276492801, 2601117357, 993977747, 3918593370, 2654263191, 753973209, 36408145, 2530585658, 25011837, 3520020182, 2088578344, 530523599, 2918365339, 1524020338, 1518925132, 3760827505, 3759777254, 1202760957, 3985898139, 3906192525, 674977740, 4174734889, 2031300136, 2019492241, 3983892565, 4153806404, 3822280332, 352677332, 2297720250, 60907813, 90501309, 3286998549, 1016092578, 2535922412, 2839152426, 457141659, 509813237, 4120667899, 652014361, 1966332200, 2975202805, 55981186, 2327461051, 676427537, 3255491064, 2882294119, 3433927263, 1307055953, 942726286, 933058658, 2468411793, 3933900994, 4215176142, 1361170020, 2001714738, 2830558078, 3274259782, 1222529897, 1679025792, 2729314320, 3714953764, 1770335741, 151462246, 3013232138, 1682292957, 1483529935, 471910574, 1539241949, 458788160, 3436315007, 1807016891, 3718408830, 978976581, 1043663428, 3165965781, 1927990952, 4200891579, 2372276910, 3208408903, 3533431907, 1412390302, 2931980059, 4132332400, 1947078029, 3881505623, 4168226417, 2941484381, 1077988104, 1320477388, 886195818, 18198404, 3786409e3, 2509781533, 112762804, 3463356488, 1866414978, 891333506, 18488651, 661792760, 1628790961, 3885187036, 3141171499, 876946877, 2693282273, 1372485963, 791857591, 2686433993, 3759982718, 3167212022, 3472953795, 2716379847, 445679433, 3561995674, 3504004811, 3574258232, 54117162, 3331405415, 2381918588, 3769707343, 4154350007, 1140177722, 4074052095, 668550556, 3214352940, 367459370, 261225585, 2610173221, 4209349473, 3468074219, 3265815641, 314222801, 3066103646, 3808782860, 282218597, 3406013506, 3773591054, 379116347, 1285071038, 846784868, 2669647154, 3771962079, 3550491691, 2305946142, 453669953, 1268987020, 3317592352, 3279303384, 3744833421, 2610507566, 3859509063, 266596637, 3847019092, 517658769, 3462560207, 3443424879, 370717030, 4247526661, 2224018117, 4143653529, 4112773975, 2788324899, 2477274417, 1456262402, 2901442914, 1517677493, 1846949527, 2295493580, 3734397586, 2176403920, 1280348187, 1908823572, 3871786941, 846861322, 1172426758, 3287448474, 3383383037, 1655181056, 3139813346, 901632758, 1897031941, 2986607138, 3066810236, 3447102507, 1393639104, 373351379, 950779232, 625454576, 3124240540, 4148612726, 2007998917, 544563296, 2244738638, 2330496472, 2058025392, 1291430526, 424198748, 50039436, 29584100, 3605783033, 2429876329, 2791104160, 1057563949, 3255363231, 3075367218, 3463963227, 1469046755, 985887462], m.exports = t
}, 19136522, []);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    const {
        OPERATIONS: l
    } = r(d[0]), n = 'SignalCollectionManager';
    let t = null;
    const s = {
        get: () => (null == t && (t = new class {
            async collectSignals(l, n) {
                const t = [];
                l.forEach(l => {
                    l.signalFlags.includes(r(d[1]).BIOMETRIC) ? this.$SignalCollectionManager1(l, n) : t.push(this.$SignalCollectionManager2(l, n))
                }), await Promise.all(t)
            }
            isEqualToLastCollectedSignal(l, n) {
                const t = r(d[2]).getLastSignalFormatBySignalId(n.signalType);
                return null != t.valueOrError && l.isEqual(t.valueOrError, new Set(n.signalFlags))
            }
            getCircularBufferSize(l) {
                const n = r(d[3]).get(),
                    t = n.getBufferSizeBySignalId(l.signalType);
                return null != t && n.getBufferSizeBySignalId(l.signalType) > 0 ? t : l.signalFlags.includes(r(d[1]).DYNAMIC) ? l.signalFlags.includes(r(d[1]).BIOMETRIC) ? n.getBiometricSignalBufferSize() : n.getDynamicSignalBufferSize() : n.getStaticSignalBufferSize()
            }
            async $SignalCollectionManager2(t, s) {
                const o = t.getSignalCollector(s);
                if (null != o) {
                    null == t.getBufferConfig() && r(d[2]).initialize(t.signalType, this.getCircularBufferSize(t), t.signalFlags);
                    try {
                        const s = await o.executeAsyncSignalCollection();
                        s.valueOrError && !this.isEqualToLastCollectedSignal(s.valueOrError, t) && r(d[2]).appendSignal(t.signalType, s)
                    } catch (t) {
                        r(d[4]).logError(n, l.BD_EXCEPTION, {
                            error: t
                        })
                    }
                }
            }
            $SignalCollectionManager1(l, n) {
                const t = l.getSignalCollector(n);
                null != t && t instanceof r(d[5]) && (null == l.getBufferConfig() && r(d[2]).initialize(l.signalType, this.getCircularBufferSize(l), l.signalFlags), t.listenForSignals())
            }
        }), t)
    };
    m.exports = s
}, 19136524, [19136513, 19136526, 19136520, 19136515, 19136517, 19136558]);
__d(function(g, r, i, a, m, e, d) {
    'use strict';
    m.exports = class extends(r(d[0])) {
        listenForSignals() {
            throw new Error('Child class responsibility to implement listenForSignals')
        }
        executeSignalCollection() {
            throw new Error('executeAsyncSignalCollection and executeSignalCollection should not be called on biometric signals')
        }
    }
}, 19136558, [19136540]);