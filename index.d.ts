declare namespace extenstion {

    interface Service {
        get(service: string, option?: Option);
        post(service: string, option?: Option);
        put(service: string, option?: Option);
        delete(service: string, option?: Option);
        patch(service: string, option?: Option);
        delete(service: string, option?: Option);
        option(service: string, option?: Option);
    }

    interface Option {
        data?: any;
        params?: any;
        headers?: any;
        timeout?: number;
        auth?: any;
    }

    interface EurekaClient {
        constructor(config: any)
        start(): void;
        stop(): void;
        getInstancesByAppId(appId: string): string[];
        getInstancesByVipAddress(vidAddress: string): string[];
    }

    class MicroService {
        init(config: any);
        getInstance(): EurekaClient;
        start();
        stop();

        service(name: string): Service | null;
    }

    namespace Swagger {
        function Document(doc);

        class Controller { }

        abstract class Swagger {
            register(target)
        }

        function EnableSwagger(prefix?: string)
    }

    namespace Actuator {

        class Loader { }

    }

}

export = extenstion