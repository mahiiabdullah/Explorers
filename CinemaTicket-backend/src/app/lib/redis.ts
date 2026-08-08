import { createClient, RedisClientType } from "redis";

export class RedisService{
    private isConnected:boolean=false
    private client:RedisClientType | null=null

    constructor(){}

    async connect():Promise<void>{
        try{
        const redisUrl = process.env.REDIS_URL
        this.client = createClient({url:redisUrl})

        this.client.on("error",(err: unknown)=>{
            console.error(err)
            this.isConnected=false
        })
        this.client.on("connect",()=>{
            console.log("COnnected successfully")
            this.isConnected=true
        })
        this.client.on("ready",()=>{
            console.log("Ready successfully")
            this.isConnected=true
        })
        this.client.on("end",()=>{
            console.log("Connection ended")
            this.isConnected=false
        })
        this.client.on("reconnect",()=>{
            console.log("Reconnected successfully")
        })

        await this.client.connect()
        }catch(err){
            console.log("Failed to connect to redis",err)
            this.isConnected=false
        }
    }
private ensureConnection():RedisClientType{
    if(!this.client){
        throw new Error("Redis client not initialized")
    }
    if(!this.isConnected){
        throw new Error("Redis client not connected")
    }
    return this.client
}

async get(key:string):Promise<string | null>{
    try{
        const client = this.ensureConnection()
        return await client.get(key)
    }catch(err){
        console.log(err)
        return null
    }
}

async set(key:string,value:any,ttlInSecond:number){
    try {
        const client = this.ensureConnection()
        const stringValue = typeof value === 'string'?value:JSON.stringify(value)
        return await client.set(key,stringValue,{EX:ttlInSecond})
    } catch (error) {
        console.error("Redis set error",error)
    }
}

async update(key:string,value:any,ttlInSecond:number){
    await this.set(key,value,ttlInSecond)
}

async delete(key:string){
    try {
        const client = this.ensureConnection()
        await client.del(key)
        
    } catch (error) {
        console.error('Redis delete error')    
    }
}

async isAvailable(){
   try {
    const client = this.ensureConnection();
    await client.ping();
    return true;
    
   } catch (error) {
    console.log(error)
    return false
   }
}

async disconnect(){
    if(this.client && this.isConnected){
        await this.client.quit()
        this.isConnected = false
    }
}
}

export const redisService = new RedisService()