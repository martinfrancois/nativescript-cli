///<reference path="../../../.d.ts"/>
"use strict";

import options = require("./../../options");
import helpers = require("./../../helpers");

export class RunApplicationOnDeviceCommand implements ICommand {

	constructor(private $devicesServices: Mobile.IDevicesServices,
		private $stringParameter: ICommandParameter) { }

	allowedParameters: ICommandParameter[] = [this.$stringParameter];

	public execute(args: string[]): IFuture<void> {
		return (() => {
			this.$devicesServices.initialize({ deviceId: options.device, skipInferPlatform: true }).wait();

			var action = (device: Mobile.IDevice) =>  { return (() => device.runApplication(args[0]).wait()).future<void>()(); };
			this.$devicesServices.execute(action).wait();
		}).future<void>()();
	}
}
$injector.registerCommand("device|run", RunApplicationOnDeviceCommand);