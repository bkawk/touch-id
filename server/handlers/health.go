package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// HealthGet handles health check requests
func HealthGet(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status": "OK",
	})
}
