#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Set default host and port from environment variables
    default_host = os.getenv('DJANGO_HOST', 'localhost')
    default_port = os.getenv('DJANGO_PORT', '5000')

    # Update the arguments if the `runserver` command is used
    if len(sys.argv) > 1 and sys.argv[1] == 'runserver':
        if len(sys.argv) == 2:  # If no host or port is specified in the command
            sys.argv.append(f'{default_host}:{default_port}')

    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
