/**
 * Registers all page data loaders.
 */

import { registerTextsDataLoader } from "~/routes/texts/texts-data";
import { registerTextDetailDataLoader } from "~/routes/texts/[id]/text-details-data";
import "~/utils/configure-framework";

registerTextsDataLoader();
registerTextDetailDataLoader();
