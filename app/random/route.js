export const revalidate = 0;

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const { streamer, channels, method, count } = searchParams;
  console.log(searchParams);

  return Response.json({ data: [{ videoId: "8lrbhS3NcFE" }] });
}
