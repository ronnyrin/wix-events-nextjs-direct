import { getWixClient } from '@app/hooks/useWixClientServer';

export default async function Success({ searchParams }: any) {
  const wixClient = await getWixClient();
  if (!searchParams.eventId || !searchParams.orderNumber) {
    return null;
  }

  const order = await wixClient.eventOrders.getOrder({
    orderNumber: searchParams.orderNumber,
    eventId: searchParams.eventId,
  });

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      params: {searchParams}
    </div>
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
