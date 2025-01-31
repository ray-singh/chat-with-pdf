export async function POST(req: Request, res : Response) {
    try {
        const body = await req.json()
        const {file_key, file_name} = body
    } catch (error) {
        console.log(error)
        return Response.json(
            {error: "Internal server error"}, 
            {status: 500})
    };
}