import { User } from 'src/entites/User';
import { getAddressFromCoordinates } from './getLocation';
import { NearbyDriver } from 'src/DTOs/nearbyDriver';
import { Repository } from 'typeorm';
import { Notification } from 'src/entites/Notification';
import { formatDate } from 'utils/dateUtils';
import { sendMessage } from './firebaseConfig';
