import { autoInject } from "api-framework";
import { General } from "./controller/General";
import { Metric } from "./controller/Metric";

@autoInject
export class Loader {

    constructor(
        readonly general: General,
        readonly metric: Metric
    ) { }

}