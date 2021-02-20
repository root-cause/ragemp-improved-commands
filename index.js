const CommandEvents = require("./CommandEvents");
const CommandRegistry = require("./CommandRegistry");

mp.events.add("playerCommand", (player, message) => {
    const args = message.trim().split(/ +/);
    const name = args.shift();
    const fullText = args.join(" ");

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
        if (typeof command.beforeRun !== "function") {
            command.run(player, fullText, ...args);
        } else {
            if (command.beforeRun(player, fullText, ...args)) {
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