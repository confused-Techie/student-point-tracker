function ownership(user, id, context) {
  // This function will be used to determine if the currently logged in `user`
  // has ownership of the resources belonging to this ID.

  if (process.env.PROD_STATUS === "dev") {
    if (
      context.config.DEV_LOGIN === user.email &&
      context.config.DEV_IS_STUDENT
    ) {
      return { ok: true };
    }
  }

  if (user.email === `${id}@${context.config.DOMAIN}`) {
    return { ok: true };
  } else {
    return {
      ok: false,
      short: "unauthorized",
      content: `The email: ${user.email} does not own the resources of ${id}.`,
    };
  }
}

function isAdmin(user, context) {
  // This function will determine if the currently logged in `user`
  // is an administrator of this system.
  // This will use the `ADMINS` array within the config to determine this.

  if (process.env.PROD_STATUS === "dev") {
    if (
      context.config.DEV_LOGIN === user.email &&
      context.config.DEV_IS_ADMIN
    ) {
      return { ok: true };
    }
  }

  if (context.config.ADMINS.includes(user.email)) {
    return { ok: true };
  } else {
    return {
      ok: false,
      short: "unauthorized",
      content: `The email: ${user.email} is not an administrator. And cannot make these changes.`,
    };
  }
}

module.exports = {
  ownership,
  isAdmin,
};
