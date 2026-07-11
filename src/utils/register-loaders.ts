/**
 * Registers all page data loaders and mutation handlers.
 */

import { registerTextsDataLoader } from "~/routes/texts/texts-data";
import { registerTextDetailDataLoader } from "~/routes/texts/[id]/text-details-data";
import { registerAnnotationsDataLoader } from "~/routes/texts/[id]/annotation-data";
import { registerMutations } from "~/utils/register-mutations";
import "~/utils/configure-framework";

registerTextsDataLoader();
registerTextDetailDataLoader();
registerAnnotationsDataLoader();
registerMutations();
