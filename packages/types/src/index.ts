export type  RedisStreamMessage = [id: string, fields: string[]];

export type RedisStream = [stream: string, messages: RedisStreamMessage[]];

export type XReadResponse = RedisStream[] | null;