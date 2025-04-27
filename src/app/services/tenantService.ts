export const checkTenantOwnership = async (userId: string, ownerId: string) => {
  if (userId === ownerId) {
    return true;
  }
  return false;
};

const tenantService = {
  checkTenantOwnership,
};

export { tenantService };

