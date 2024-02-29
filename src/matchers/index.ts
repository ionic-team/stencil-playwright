import { toHaveFirstReceivedEventDetail } from './toHaveFirstReceivedEventDetail';
import { toHaveNthReceivedEventDetail } from './toHaveNthReceivedEventDetail';
import { toHaveReceivedEvent } from './toHaveReceivedEvent';
import { toHaveReceivedEventDetail } from './toHaveReceivedEventDetail';
import { toHaveReceivedEventTimes } from './toHaveReceivedEventTimes';

export const matchers = {
  toHaveReceivedEvent,
  toHaveReceivedEventDetail,
  toHaveReceivedEventTimes,
  toHaveFirstReceivedEventDetail,
  toHaveNthReceivedEventDetail,
};
