const { CommandEvents, CommandRegistry } = require("../improved-commands");

// Should we inform the player when they enter an invalid command? Probably...
// Note that commands added with mp.events.addCommand aren't known by this resource so they'll trigger the not found message
// This is disabled by default
CommandRegistry.notFoundMessageEnabled = true;

// Events
// Example: Players can't use commands in a vehicle
CommandEvents.on("receive", function (player, command, fullText, commandArgs, cancel) {
    if (player.vehicle) {
        player.outputChatBox("You cannot use commands in a vehicle.");
        cancel.cancel = true;
    }
});

// Example: Send a message to the player and print the error to the console on execution failure
CommandEvents.on("fail", function (player, command, fullText, commandArgs, error) {
    player.outputChatBox(`Failed to run command "${command.name}".`);
    console.error(error.stack || error);
});

// Commands
// Example: /argtest lorem ipsum dolor sit amet -> results in "You wrote: lorem ipsum dolor sit amet"
CommandRegistry.add({
    name: "argtest",
    aliases: ["echo", "combineargs"],
    beforeRun: function (player, fullText) {
        if (fullText.length === 0) {
            player.outputChatBox("No arguments provided.");
            return false;
        }

        return true;
    },
    run: function (player, fullText) {
        player.outputChatBox(`You wrote: ${fullText}`);
    }
});

// Example: /freemode_male_only -> will only work when player's model is mp_m_freemode_01
CommandRegistry.add({
    name: "freemode_male_only",
    beforeRun: function (player) {
        return player.model === mp.joaat("mp_m_freemode_01");
    },
    run: function (player) {
        player.outputChatBox("Yes, only freemode male can run this command.");
    }
});

// Example: /boom -> will emit "fail" event
CommandRegistry.add({
    name: "boom",
    run: function (player) {
        throw new Error("error thrown");
    }
});

// Properties that aren't named "name", "aliases", "beforeRun" or "run" will be collected into the "extra" property
// Example: /getweapon weapon_carbinerifle 500 -> will only work when player's adminLevel property value is equal to or higher than cmdAdminLevel extra property
CommandRegistry.add({
    name: "getweapon",
    aliases: ["giveweapon"],

    // You can access this property in handlers by using "this.extra.cmdAdminLevel" if the handlers are regular functions (meaning it doesn't work with arrow functions!)
    cmdAdminLevel: 5,

    beforeRun: function (player) {
        return player.adminLevel >= this.extra.cmdAdminLevel;
    },
    run: function (player, fullText, weaponName, ammo = 9999) {
        // You can do this in beforeRun as well (see argtest example)
        if (!weaponName || weaponName.length === 0) {
            player.outputChatBox("Syntax: /getweapon [name]");
            return;
        }

        player.giveWeapon(mp.joaat(weaponName), Number(ammo));
        player.outputChatBox(`Gave yourself ${weaponName} with ${ammo} ammo.`);
    }
});

// Example: Extra property #2
CommandRegistry.add({
    name: "count_runs",

    // You can access this property in handlers by using "this.extra.timesRan" if the handlers are regular functions (meaning it doesn't work with arrow functions!)
    timesRan: 0,

    beforeRun: function (player) {
        player.outputChatBox(`This command was used ${this.extra.timesRan} time(s).`);
        return true;
    },
    run: function (player) {
        this.extra.timesRan++;
        player.outputChatBox(`Now it's used ${this.extra.timesRan} time(s).`);
    }
});

// Example: List all commands
CommandRegistry.add({
    name: "commands",
    aliases: ["cmds"],
    run: function (player) {
        const commands = CommandRegistry.getNamesWithAliases();
        commands.sort();

        player.outputChatBox(`Commands: ${commands.join(", ")}`);
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Example: Async beforeRun
// Important: You should check if player object is still valid by mp.players.exists(player) after awaiting
CommandRegistry.add({
    name: "async",
    beforeRun: async function (player) {
        // Getting data from slow API
        await sleep(5000);

        const result = Math.random() < 0.5;
        if (result) {
            player.outputChatBox("You're allowed...");
        } else {
            player.outputChatBox("You're not allowed...");
        }

        return result;
    },
    run: async function (player) {
        // Getting data from slow API again
        await sleep(2000);

        if (Math.random() < 0.5) {
            player.outputChatBox("You waited for nothing!");
        } else {
            throw new Error("Failed so bad it caused an error"); // should emit fail
        }
    }
});