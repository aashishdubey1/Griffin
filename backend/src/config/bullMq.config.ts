import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";
import { codeReviewQueue } from "../queues/codeReviewerQueue";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/ui/queues");

const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullMQAdapter(codeReviewQueue)],
  serverAdapter: serverAdapter,
});

export default serverAdapter;
