declare namespace extenstion {

    interface Service {
        get(service: string, option?: Option): ServiceResult;
        post(service: string, option?: Option): ServiceResult;
        put(service: string, option?: Option): ServiceResult;
        delete(service: string, option?: Option): ServiceResult;
        patch(service: string, option?: Option): ServiceResult;
        delete(service: string, option?: Option): ServiceResult;
        option(service: string, option?: Option): ServiceResult;
    }

    interface Option {
        data?: any;
        params?: any;
        headers?: any;
        timeout?: number;
        auth?: any;
    }

    interface ServiceResult {
        toJSON(): any;
        read(): any;
        body: string;
        status: number;
        data: any;
        headers: ServiceHeaders
    }

    interface ServiceHeaders {
        headers: any;
        rawHeaders: any;
    }

    interface EurekaClient {
        constructor(config: any)
        start(): void;
        stop(): void;
        getInstancesByAppId(appId: string): string[];
        getInstancesByVipAddress(vidAddress: string): string[];
    }

    class MicroService {
        instance: EurekaClient;

        init(config: any);
        start();
        stop();

        get(name: string): Service | null;
        services: Service[]
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