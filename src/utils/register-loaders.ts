/**
 * Registers all page data loaders and mutation handlers.
 */

import { registerTextsDataLoader } from "~/routes/texts/texts-data";
import { registerTextDetailDataLoader } from "~/routes/texts/[id]/text-details-data";
import { registerAnnotationsDataLoader } from "~/routes/texts/[id]/annotation-data";
import { registerMutations } from "~/utils/register-mutations";
import { registerGlobalDataLoaders } from "~/utils/global-data";
import "~/utils/configure-framework";

registerGlobalDataLoaders();
registerTextsDataLoader();
registerTextDetailDataLoader();
registerAnnotationsDataLoader();
registerMutations();
