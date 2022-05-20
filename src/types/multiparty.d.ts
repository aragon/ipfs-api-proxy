import {Form} from "multiparty";

declare module "multiparty" {
  interface Form extends Form {
    bytesReceived: number;
  }
}
