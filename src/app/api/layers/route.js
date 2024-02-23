// Import main function to generate the url
import generateLayer from "@/app/module/ee-script";

/**
 * Router handler for layer router
 * @param {Request} request 
 */
export async function POST(request){
	const body = await request.json();
	const { result, ok } = await generateLayer(body);
	return new Response(JSON.stringify(result), {
		status: ok ? 200 : 404
	});
}