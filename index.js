const CommandEvents = require("./CommandEvents");
const CommandRegistry = require("./CommandRegistry");

mp.events.add("playerCommand", async (player, message) => {
    message = message.trim();

    const args = message.split(/ +/);
    const name = args.shift();
    const fullText = message.substring(name.length + 1); // +1 for the space after command name

    // Check if command exists
    const command = CommandRegistry.find(name);
    if (!command) {
        if (CommandRegistry.notFoundMessageEnabled) {
            player.outputChatBox(CommandRegistry.notFoundMessage);
        }

        return;
    }

    const cancel = { cancel: false };
    CommandEvents.emit("receive", player, command, fullText, args, cancel);

    // Handle cancellation
    if (cancel && cancel.cancel) {
        return;
    }

    try {
        let shouldRun = true;

        // Handle beforeRun
        if (typeof command.beforeRun === "function") {
            if (command.beforeRun.constructor.name === "AsyncFunction") {
                shouldRun = await command.beforeRun(player, fullText, ...args);
            } else {
                shouldRun = command.beforeRun(player, fullText, ...args);
            }
        }

        // Handle run
        if (shouldRun === true /* explicitly checking for true in case of beforeRun returning non-boolean */) {
            if (command.run.constructor.name === "AsyncFunction") {
                await command.run(player, fullText, ...args);
            } else {
                command.run(player, fullText, ...args);
            }
        }
    } catch (e) {
        CommandEvents.emit("fail", player, command, fullText, args, e);
    }
});

module.exports = {
    CommandEvents,
    CommandRegistry
};