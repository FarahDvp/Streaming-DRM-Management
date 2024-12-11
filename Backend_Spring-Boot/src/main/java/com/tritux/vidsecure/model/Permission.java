package com.tritux.vidsecure.model;

import java.util.HashMap;
import java.util.Map;

public enum Permission {
    ADMIN_READ("admin:read"),
    ADMIN_UPDATE("admin:update"),
    ADMIN_CREATE("admin:create"),
    ADMIN_DELETE("admin:delete");

    private final String permission;
    private static final Map<String, Permission> PERMISSION_MAP = new HashMap<>();

    static {
        for (Permission permission : values()) {
            PERMISSION_MAP.put(permission.getPermission(), permission);
        }
    }

    Permission(String permission) {
        this.permission = permission;
    }

    public String getPermission() {
        return permission;
    }
}
