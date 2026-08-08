import { prisma } from "../../lib/prisma"

const seatMap = async(screenId:string)=>{
    const seats = await prisma.seats.findMany({
        where:{
            screenId:screenId
        },
        include:{
            showSeats:true
        }
    })

}



export const seatsService = {}