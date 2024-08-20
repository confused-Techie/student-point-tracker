# Troubleshooting

## Tasks aren't running on time

Ensure the time zone of your operating system is set properly.
If it is set incorrectly the scheduler within SPT will assume whatever time zone the OS
that hosts it, is local.

If the time zone was previously set incorrectly, and it has been resolved ensure to restart
the SPT instance so that it's able to reschedule it's tasks, otherwise they will still be set
based on the old incorrect time zone.
