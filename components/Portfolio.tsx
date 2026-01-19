import React, { useState } from 'react';
import max1 from '../img/max1.jpeg';
import max2 from '../img/max2.jpeg';
import max3 from '../img/max3.jpeg';
import art1 from '../img/art1.jpeg';
import art2 from '../img/art2.jpeg';
import art3 from '../img/art3.jpeg';
import por1 from '../img/por1.jpeg';
import por2 from '../img/por2.jpeg';
import por3 from '../img/por3.jpeg';
import prss1 from '../img/prss1.jpeg';
import prss2 from '../img/prss2.jpeg';
import prss3 from '../img/prss3.jpeg';
import rcam1 from '../img/rcam1.jpeg';
import rcam2 from '../img/rcam2.jpeg';
import rcam3 from '../img/rcam3.jpeg';
import rhno1 from '../img/rhno1.jpeg';
import rhno2 from '../img/rhno2.jpeg';
import rhno3 from '../img/rhno3.jpeg';
import sct1 from '../img/sct1.jpeg';
import sct2 from '../img/sct2.jpeg';
import sct3 from '../img/sct3.jpeg';
// إضافة Sparkles للاستيراد
import { Layers, ExternalLink, Sparkles } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  category: string;
  image: string;
}

const projects: Project[] = [
  { id: 1, title: "تصميم فيلا مودرن - الرياض", category: "3Ds Max", image: `${max1}` },
  { id: 2, title: "تصميم فيلا مودرن - الرياض", category: "3Ds Max", image: `${max2}` },
  { id: 3, title: "تصميم فيلا مودرن - الرياض", category: "3Ds Max", image: `${max3}` },
  { id: 4, title: "مخطط تنفيذي لمكتب إداري", category: "ArtCam", image: `${art1}` },
  { id: 5, title: "مخطط تنفيذي لمكتب إداري", category: "ArtCam", image: `${art2}` },
  { id: 6, title: "مخطط تنفيذي لمكتب إداري", category: "ArtCam", image: `${art3}` },
  { id: 7, title: "مخطط تنفيذي لمكتب إداري", category: "PowerMILL", image: `${por1}` },
  { id: 8, title: "مخطط تنفيذي لمكتب إداري", category: "PowerMILL", image: `${por2}` },
  { id: 9, title: "مخطط تنفيذي لمكتب إداري", category: "PowerMILL", image: `${por3}` },
  { id: 10, title: "مخطط تنفيذي لمكتب إداري", category: "Grasshopper", image: `${prss1}` },
  { id: 11, title: "مخطط تنفيذي لمكتب إداري", category: "Grasshopper", image: `${prss2}` },
  { id: 12, title: "مخطط تنفيذي لمكتب إداري", category: "Grasshopper", image: `${prss3}` },
  { id: 13, title: "مخطط تنفيذي لمكتب إداري", category: "Rhino CAM", image: `${rcam1}` },
  { id: 14, title: "مخطط تنفيذي لمكتب إداري", category: "Rhino CAM", image: `${rcam2}` },
  { id: 15, title: "مخطط تنفيذي لمكتب إداري", category: "Rhino CAM", image: `${rcam3}` },
  { id: 16, title: "مخطط تنفيذي لمكتب إداري", category: "Rhino", image: `${rhno1}` },
  { id: 17, title: "مخطط تنفيذي لمكتب إداري", category: "Rhino", image: `${rhno2}` },
  { id: 18, title: "مخطط تنفيذي لمكتب إداري", category: "Rhino", image: `${rhno3}` },
  { id: 19, title: "مخطط تنفيذي لمكتب إداري", category: "SketchUp", image: `${sct1}` },
  { id: 20, title: "مخطط تنفيذي لمكتب إداري", category: "SketchUp", image: `${sct2}` },
  { id: 21, title: "مخطط تنفيذي لمكتب إداري", category: "SketchUp", image: `${sct3}` },
  
];

const categories = [
  { name: "الكل", image: "https://static.vecteezy.com/system/resources/thumbnails/006/201/197/small_2x/cnc-computer-numerical-control-icon-vector.jpg" },
  { name: "3Ds Max", image: "https://www.bing.com/th/id/OIP.TNp5iaHPjzUs5DlZzx3sfQHaHa?w=211&h=211&c=8&rs=1&qlt=90&r=0&o=6&dpr=1.4&pid=3.1&rm=2" },
  { name: "ArtCam", image: "https://tse2.mm.bing.net/th/id/OIP.hn9w_dAD9HEmeB9rs2331AHaEo?rs=1&pid=ImgDetMain&o=7&rm=3" },
  { name: "SketchUp", image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAsJCQcJCQcJCQkJCwkJCQkJCQsJCwsMCwsLDA0QDBEODQ4MEhkSJRodJR0ZHxwpKRYlNzU2GioyPi0pMBk7IRP/2wBDAQcICAsJCxULCxUsHRkdLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCwsLCz/wAARCAEFAVwDASIAAhEBAxEB/8QAHAABAAMAAwEBAAAAAAAAAAAAAAEGBwMEBQII/8QASBAAAQMDAQQFCAgDBgUFAQAAAQACAwQFESEGEjFhEyJBUXEHFDJ0gZGyszQ1NmNydaGxIyRzQlJiotHwFTOCksElVIPCw+H/xAAaAQEAAwEBAQAAAAAAAAAAAAAABAUGAwIB/8QAMREAAgIBAwIFAwQBBQEBAAAAAAECAwQFESEiMRIzUXGhEzJhNEGBkUIUI7HR4fAk/9oADAMBAAIRAxEAPwDW0REAREQBERAEREAREQBERAEREAREQBEUduEBKj/fBeHcdq9nLaXRy1YnnboYaMdM8HucQdwe1wVWq/KNOSRQ2yNo1w+slLz4lkWB/nUmvFusW8YkWzLpq4lI0XPNMrI5duNq5CSyop4QeyGmj08DLvFdY7XbWk5/4pL7IqYf/mpS0u592iG9VpXZM2XKaLHWbZbXR4/9RLuUkFM7/wCmV36bygbQRYE8FDUN7cxviefAsdu/5V8lply7bM9R1Sh990aoipVF5QrPMWtraWopCcAvZieIcyWgP/ylWujuFuuEfTUVTDUR6ZMLw4tz/ebxHtCh2UWVfetibVfXb9j3O0ihSuJ3CIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiKEBKLp3C5W22QGorqmOCPXd3zl7yNcRsHWJ8As8vW3VfV9JBamuo6c5BndjzuQf4caN9mTzCk0Y1l76FwRb8quhdb5LteNo7NZWkVU2/UkZZSwYfO7PAuGcAcyQs2vW1l6u+/EHmkoySBTU7zlw+9l0cfDQclX3Oc9z3vc5z3uLnucS5znHiSTrlQr7HwK6eXyzP5GoWXcLhDTs0RQpU8rgihSvoCBEQDVc1NU1dHM2opJ5YJmejJE4td4HsI5FcClfGk1sz6m090aFZdvmncp73HunQCsgYdz/AOaIajmR7lfIJ6epijnp5Y5YpBlkkTg9jhyIWAr0LZeLraJTJQVLow4gyRO68EuP78Z09oweaqMjTYy5q4fp+xb42pyj028o3NFUrLtrarj0cFdu0NYcD+I7+WkP+CV2MeBx4lWzP6qksqnU9prYvq7YWrxQe5KKApXM6hERAEREAREQBERAEREAREQBERAEREAREQBERAERPagIRFVr1tnaLYXwUpFdWNy0shfiCJ33koyPYM+xdK6p2PwwW7OVlsKl4pvZFmlmhgjkmmkZHFGN6SSVwYxo7y52io962+hj34LLGJn6g1c7SIm/0ozgnxOByKpV1vd2vEm/XVBcxrt6KCPqU8X4Gf8AkklebkntV3j6bGPVby/QosnU5S6auF6nPV1lZXTPqayeWed3F8riSB3NHADuAC4MomqtlFJbIp3Jye7IUooJDQS4gDvK9HwlMKyWfY2+XUMmmHmFG7BbJUsJnkHfHDocc3Ee1Xai2G2ZpQ0zQy1sg4urJCWk8omYZj2FQLs+mp7b7v8ABPp0+61b7bIyTej4b7c928Mr6DXngyQ8wx5H6BbvBb7XTNDaaipIQMaRQRs4eAXa0GgwPDRQnqvpD5Jy0j1l8H59O630ur+IFv7qBg8CCO8HK/QD4oZARJHG8HQ77Gu/cLyqvZnZmt3umtlMHEenA3oJP+6HdK9R1WL+6PyeZaTJfbIxXCaLQ7h5O4yHPtVc5juIgreuw8hKwbw9oKpFwttytc/QXCmfA8k7hIzHKB/aikGhH+8KwpyqrvtZXXYltP3rg6aIUUoijK9+y7VXmz9HGH+dUTSB5tUOPUHb0Mmpb+o5LwEXKyqFi2mtzpXbOp7wextNn2js96a1tNL0dVgF9LPhsw0yd0cCOY/Reyvz+1zmOa9rnNe0hzXMJDmkdoI1Vxsu3VfSbkF1DqynGAJ24FVGP8XY79DzKpMjTZR6quV6F9j6nGXTbx+TUEXTt9yt1zgFRQ1Mc0egdunD2E9j2HrA+IXc9qqWnF7MuFJSW6CIi+H0IiIAiIgCIiAIiIAiIgCIiAIiIAiIgIXkXjaKzWVp86m3qndyylgw+d2eBLc4A5khdi7U1zq6KWG213mVS70ZujD8jByzJ1Ge8ahY5dLXeLVO5tzhka+V7iJ3OMkU7u1zZu0+OvJTsPGhfLrlt+CvzcmdEeiO/wCT0r1tbebvvwh/mlE7Tzenccvb99Lo4+Gg5Ku/siLS11QrXhgtjMWWztfim9woRF0OZKd6LvWuotdLWRTXKg8+pm8YekLcOyCH7voux3HReZtqLaW56hFSkk3sc9osF5vbh5nBu0+cPq58sp2667p4uPIe8LSbLsfZrRuTyDzyvGD5xUNBEbvuY/Rb46nmvTtV0s9zp2PtssbmRsa0wtAjkgGMBrouI/ZcN32hs9lafO5t6oLcx0sGHzu7iW5wBzJCzl+VffL6aW34/c0tGLRRD6jaf5/Y9caaaqu3PbHZ23OfEJnVdQ0kOjogHhpHY+UkM/U+CoN62tvN334g7zSiOR5vTuOZG/fSaE+Gg5Ku8FIo0zfm1/wRsjVNntSv5L1UeUWucT5pbaaNvYamWSV3tDA0fqug7b7adxJb5gwZyA2ncdO7rPKqmUVjHCoj/iitlnZD/wAi4R+UHaFh/iQW6UdxilYfe2T/AML2KLyiUTy1tfQTQ9hkpniZo5ljg13uys3yi8zwKJf47HqGoXx/y39zd6G5Wy5xGagqop2DAf0buswnskYesD4hfdVR0dbC+nq4Ip4XjDo5WhzTz17e4rC6WrrKKZlRSTywTs9GSJxacdx7CORCv9l2+jeGQXqMRO0ArIGnoj/VjGo8Rkcgqq/T7KuqvlfJbY+o12rw2cP4OretgpoukqLLIZWak0c7h0gHdDK7jyDveqPLFNBJJDPHJDPGcSRStLJGnm12q3uGaCojjmhkjlikGY5InB7HDk5ui6F1sVovMe5W04c9oIinZhk8XNjxr7Dkcl9x9RnDpt5R8yNNhZ1VcMxBFZ71sZeLZ0k1MDXUQyd+Jv8AMRN+8iHHxbnwCrGh1HBXtV0LV4oMobaZ1PwzQUKdFC6nI7FJWVtDMypo55IJ28HxuxkdzhwI5ELQLLt9TydHT3qMQyaNFXCCYXHvkYNW+IyPBZwmVFvxa711Ln1JVGVZQ+l8ehv8csM0cc0MjJIpGh0ckTmvY5p7WubouQLD7Te7vZpN+inIjccyU8mX08mv9pnYeYIK0zZ/ayhvbvNjFJT17Y3SOidl8b2NIDnRyDxGhAKocjBsp5XKNBjZ9d3S+GWRERQCxCIiAIiIAiIgCIiAIiIAiIgC69bUx0VJWVcjXOjpoJZ3hmN4tjaXENyQMrsLzL99SX38urPlFeoreSTPE3tFtH3bLxarvD01DUMkwB0kZ6s0R7pI3dYLtVFPTVUT4KmKOaGQYfHK0PY4cw5YPBUVFLLHUU0skM8eCySJxa8e0divdl29I6OC9x6aNFbA39Zom/qW+5Wd+nTr6qnuvkq6NShZ0WrZ/BN62B9OosjwO00U7tPCGU8OQPvVDqKeppZpKeqhkgnjOHxytLXD36Y7iFu9PU0tXDHUU00c0MgyySF4ew+0LrXK0Wq7Q9DXU7JQAejfgiWIntjkb1glGo2V9NnK+RkabCxeKrh/BhiYKtt62Iutv6Se3l1dSDJLQAKuNvNg0d7NeSqZGMg5BBLSCCCCNCCD2q8qvhat4MobaJ0vwzWxCIoXY4nNBUVNLLHPTTSwzszuSRPcx7c8cFpXw973vfI97nySOLpHvcXOc48S5x1JXwi+bLfc++J7bEooRfT4FKhSgIREQBTr3qEQHp2u93azyb9DUFjC7ekgfl1PL+JnfzGCtGsu2lpuXRwVZFDWHA3ZXfwJXfdynT2HHtWTKeOhGfHgoeRh138tbP1JmPm2UcJ7r0P0Eq3etkLPdukmY3zSudkmogaMSH76PRp8dDzVCsu1l4s+5EXmrohgebVDiSwfcyauHhqOS0mz7R2a9NApZSypxmSlnwydumTgZw4cwT7FR2Y92JLxR/tF9XkUZcfDLv6Myq72C82Z588gBgJxHVQZfTv7gTjLTyOPavKwVv72RyseyRjXseC17JGhzXA8Q4HRUq9bB0k+/PZnspZjlxppN40z+TDqWn3jkFPo1JS4t4/JX5OmSjzVz+DNEXNU089JPPTVDNyeCR0UrMg7r26EZbouFXCe63RStbcMlWrYL7QD8vq/ijVUVr2C+0A/L6v4o1Gy/Il7ErD8+HuayihSskbEIiIAiIgCIiAIiIAiIgCIiALzL/8AUl9/Lqz5RXprzL/9SX38urPlle6/vXueLPsfsYf/AKBE/wBEW0MOd623W6WmXpqCofE4nMjPShlHdIw6H91otl24tlcY4LiG0NUSGh7nZpZCeGHnVp5H3lZZlFEvxK7uWufUl4+ZZR2fHofoEEOAIIIOCCMYI7wV4d62Xs15DpJI+grMdWqpwBIf6g4OHis2s21F5spZHFJ09GCN6lqCSwDt6J3pN9mnIrSrNtPZryGMik6CrIy6lnIEhPb0Z4OHh7gqK3FuxX449vVF9VlU5UfBLv6MzS87M3mylz5o+npAdKunDjGB9630mnx05rxF+gXAOBBGQRggjQjmCqfethbdW9JUW0toaokuMbRmlkPNg9E8x7ipuPqafFv9kHI0vbqp/oy1F3rja7napugr6Z8LiT0b/SilA7Y5B1T+/JdLBVzGSmt4vcppRlB7SWzIRSoXo8n03dy3eyW5G8GkBxb24JBH6K62Sx7C3lrWRV1zZV4y6mqJ4GS6cdzdjDXDw/RUlSHEFpBIc0gtLSQ4HvBGq4XVSsXTLZnei2Nb3lHdGlTeTqzuB6C4XCJ3Z0nQSN9o3Af1Xi1vk+vUAc+iqaasaODHB1PMRy3i5hP/AFBLLtzcaPo4LmHVlMMN6XIFXGPE6OHjrzWiW66Wy6w9PQ1LJmADfAyJIyeyRjusD7FS2W5eM+p7ou66sPJXStmYjVUlZRTGnrKeanmH9iZhaTzaeBHgVwLd663W65wOp66njniPAPHWYeG8xw6wPMFZ5edhK+k6Se0udVwDJNPIQKlg/wADvRcPcfFTaNRhZxPh/BCyNNnX1V8r5KWoX05r2Oex7XNewlr2SNLXscOIc12oUKzT3KrZoKWuexzXsc5r2EOY5ji1zSO1pGuVCI+QnsX7Zba66z1tDaq8CqbUOMcVSTuzxlrHP/iEaOGmOw8ytE7li+yv2ksPrEvyJFtPcs1qNUK7ehbbmo022VlXU99jENovr6/fmFT8S8pertF9fX78wqfiXlLQ0+XH2RnL/Ml7sK17BfaAfl9X8UaqitewX2gH5fV/FGuWX5MvY64fnw9zWFKhSskbEIiIAiIgCIiAaJoiIBomiIgGiaIiAaLpXSnlrLdc6SIsElTSVEEZeSGh72Fo3iNcLuphfU2nuj414lszB6+23G1zGCvp3wvOQwuGY5QO2N46pH+9F1FvdVR0dbBJT1cEU8Lx1o5W7zfEc1QLzsFLH0k9lkMjRlxo53ddo44hldofB3vWgx9RhPps4fwZzI0ycOqvlFCRck0M9PI+GeKSKaM4kilaWPaeYOq+Fap7lQ01wyFIOCDwIILSDggjgQQoU5RrcLgt9l23udDuQXEOraUYAeT/ADcY5POjvbrzWi227Wu7QiahqGSjA32Z3ZYz3SRnrBYWuWnqaqkmjqKWaSGdh6kkTi1w5ZHZyVbkafCzmHDLTH1GdXTPlG71NLSVkMkFVDHNBIMPjlaHNPsKoN62BezpJ7JJvN1caOod1vCGU/oHe9clm2+9CC9sxwArKdpx3ZmiHDxb7le6eopqqKOemmjmhkGWSRODmO8CFU/7+HL0/wCC3/8Az5sf/tzBpoZ6aWSCoikhnjOHxTNLHt8QVxrcbpZrVeIuirqdshb/AMuVvVniPfHI3Ufss5vOxN1t2/PQ79dRjJxG3+aiA/vxjR3iPcrfH1Cu3plwynyNOsq6o8oqalO8Y7SOYI7CisdysC56aqq6KZlRSTyQTs9GSJxDsdx7xyK4ERpNbM+ptPdGiWXb6J+5T3pgjdo0VkDT0Z5zRjUeIz4BXqGeCojZLBJHLFIMskicHscOTm6LAcletYrtdbZW0baOpeyKoq6eKeF3WhkbJI1hzGdM68RgqnydNi95V8fj9i5xtSmmoWc/n9zVLxs5Zr03NVDuVAGI6qDDJ29wLu0ciCsmvVrfZ7jU0D5mzGIRvEjWlm82RocMtJOvfqtx/wBVkW2/2jr/AOjR/JauGmWz+p4N+NjvqdMFWrEudytIiLQGePa2V+0lh9Yk+RIto7li+yv2ksPrEnyJFtPcs7qnmr2NJpXlP3MQ2i+vr9+YVPxLyl6u0X19fvzCp+JeUr2ny4+yKC/zJe7CtewX2gH5fV/FGqorXsF9oB+X1fxRrll+TL2OuH58Pc1jTKnRQpWSNiNE0REA0TREQDRNERAEREAREQBERAEREAUKUQHmXWyWm8RdHW07XuaP4UzOpPEf8Eg19nDks4vWxd3tvSTUm9XUY62Y2/zMTfvIm8fFvuC1pQpVGVZR9r49CJfh13/cufU/PvHh3kHkR2ItgvWyVmu+/Nuea1x1FTTgDeP30fou/Q81m132evNlcTVQ79NnDKuAF0B7t88WnxHtKv8AHza7uOzM7kYNlPPdHkImmEU4ghd+23e62iXpaCofHvHMkZ60EuNMSRnQ+PHmugi8SgpraS3PUJyg94vY1Sy7bWuv3IK8Noat2Ggud/LSnh1ZDw8D7yraCCBg8RkEa6HtX5+yves21N5sxZHHJ5xRjGaWocS1o+6f6Tf25Knv0xPmn+i7x9Ta6bv7NEvWydmvG/KWGmrTr5zTgBzj96z0XDx15rNrxs5erK5zqmLpaXOG1cALoT3dJ2tPj7ytOs+01mvQayCXoqvGXUtQQ2XTj0Z4OHh7gvaLWuDmuALXAtc0gEEHQggqHVlXYz8Eu3oyZbh05K8UO/qj8/IrXttbLdbLjRihgbAyqpnzSxx5Ee+JN3LG8B4DTkqotDTarYKa/czd1Tpm4P8AYLsUP062ev0fz2LrrsUP062ev0fzmL3P7Wea/vXub3/qsh24+0df/Ro/ktWvf6rIduPtHX/0aP5LVndM87+GaPVPI/lFaREWlMye1sr9pLD6xJ8iRbT3LFtlftJYf68nyJFtPd7FndU81expNK8p+5iG0X19fvzCp+JeUvV2i+vr9+YVPxLyle0+XH2RQX+ZL3YVr2C+0A/L6v4o1VVatgvtAPy+r+KNcsvyZex1w/Ph7msKVClZI2IREQBERAEREAREQBERAEREAREQBFGVxz1FNTRST1EscMMY3nySuaxjRzcdE7h8HIulcbpbLVD09dUsiaQdxpOZJSOyNg6xVNvW3zG9JBZI953A1lQ0ho5xRO1PIux4FUKpqqusmfUVc8s87/SklcXO8By7grTH06c+bOF8lTkalCvivl/BtVrvdovMe/Qzhz2jMkMg3J4/xRnX2jI5r0HNY9rmOa1zXAtc1wBBB0IIKwKKaaCRk0EskU0ZDo5InuY9p7w5uqvFl29nj3IL1GZY9A2rgaBK0d8sY0PiMeBX2/TZ19VfK+Tzj6nCzpt4fweledhKGq357S5tHUHLjA4E0kh5AZc32ZHJZ5X2642ybzevppIJNdzfGWSAdsbx1SPArcaStoq6BlTRzxzwP4PicHDPce0HvBUVlFRV8L6esginhdxZK0EZ7weIPMLxRn2Uvwz5XydMjT67l4q+H8GC6or1etgp4ukqLLIZo8Fxo53DpW41xFKcA+BweZVHlilhkkhmjkimjJbJFK0skYe5zXaq9pvruW8GUF2PZS9po+UUIpBHDnOa0uaS1zQXNc04c1w4EEa5W+0pJpqQk5JghJJOSSWDUrAX+hJ+F37LfqT6LR+rw/AFSar2iXmk95GdeUX6xtPqUnzSqQrv5RfrC0+pSfNKpCnYPkRIGf8AqJBdih+nWz1+j+cxdddih+n2z16j+cxSp/ayLX969zeisd2xmZNtHdi3VsZp4M/4o4WB36rW62rgoaWrrJziKmikmfzDRnA5ngFhNRPJVVFTUy/82ollnk/HI4uKotLrbnKfoX2rWJQjD15OJERaAzx7Wyv2ksPrEnyJFtPcsW2V+0dh9Yk+RIto7lndU81expNK8p+5iO0X19fvzCp+JeUvV2i+vr9+YVPxLyle0+XH2RQX+ZL3YVr2C+0A/L6v4o1VFa9gvtAPy+r+KNcsvyZex1w/Ph7msKVClZI2IREQBERAEREAREQBERAEREARF8uc1oc5zg1rWlznOOAANSSSgOhdqq5UlHLNbqHz2pbwhMgZhuD18cTjuBBKx663a8XSdzrjPK58TyBTlpijpz/dbD2Hx15rb2PjkY17HNex7Q5jmEOa5p1BaRpheTeNnLPe2k1MO5UAYZVQYbO3HAE4wRyIKnYeRCmXXH+f3K/Mxp3x6JfwYqVCsV62TvVn35dzzuiBP8zTtOWN++i1cPHUc1XtOP7cFpa7YWrxQe6MxZVOp+Ga2ZCnmiL2czt0FxuVsn84oaiSCT+3u4LJAOyRh6pHiFodl27oKro4LqxtHUHAE7cmlef8ROrfbpzWYoot+JXeurv6kujLsofS+PQ/QLXNe1rmOa5jgHNc0gtcDqCCNMKjeUSKEUVrm6NnTGsdF0m6Ok6PonO3d7jjKp9n2ivNmc1tNNv02cupZ8uhPfu9rT4L19ptpKC/Wu2tiZJDVQ1ZfPBIC4NaYnN3mSAYIz4HkquvCsovjLui1tza76JR7PYp6IpV+Z8+X+hJ+F37LfqT6LR+rwfAFgL/AEJPwu/Zb9SfRaP1eH4AqTVe0S80jvIzryi/WFp9Sk+aVSFd/KL9YWn1KT5pVIKnYXkRIGf+okQuzQ/TrZ69R/OYuuvuGV8E0E7Mb8Esc0e8MjfjcHtyPEKXJNppESLSkmy/bfXofw7JTv8A7TaivLf+6OE/o4+xZ8vuaaaommnme6SaeR8sr3cXPccklfC441CorUEdsm932ObCIikEcsuw9O6baKjfjq0tPV1Lv+zoW/q79FrvaPEKheTu3uZDcro8fSHto6cntjh6z3Dxccf9Kt15rW261XOtLsOgppDGfvXDcjHvIWYzpfUyPCvY1OBH6WP4n7mMXacVN0u1QPRmrquRv4TK7C6Snu7TjXxULSxXhikZicvFJsK17BfaAfl9X8Uaqqtvk/jc++zPHow22cu8XyRNA/f3KPmPaiXsSMNb3w9zVe1SiLJGxCIiAIiIAiIgCIiAIiIAiIgC+Xta9r2uGWvaWuHIjBX0oQGNUd4vmzNbWUlPNvQ01TLDLSz5dA7ceW5aCcgkDiD71odl2us133IXP81rTgeb1Dhh7vuZNGn9DyVM28t3mt4bWNaRDcoRITjQTxARvHu3T7VU9f2Wi/01WXWp9mzM/wCqtxLXX3SP0BjOcqq3rYm03LpJ6MihrHdZzomjoJXfeRDTJ7xj2qo2XbO72zo4Komuom4buyu/mI2jT+HKc58DnxC0e1Xu03mPfop2ucBmSB43J4vxxk5xzGRzVXOm/El4l/ZbQvozI+F/0Y/c7NdrPJ0dfTuY1zi2KZnWgl/BJwzyODyXnrfZoKeoikhnijlhkBa+OVocxw7iHaKi3rYFjt+eySBjtSaOdxMZ5QynUeBz4hWOPqUZdNvD+CtyNMlHqq5Rnihc9TTVdHNJT1cEsE7PSjmaWu8R2EcxlcCt001uinacXsyUUIvp8CIiAh/oSfhd+y36k+i0fq8PwBYC/wBCT8Lv2W/Un0Wj9Xh+AKk1XtEvNI7yM68ov1hafUpPmlUhXfyi/WFp9Sk+aVSFOwvIiQM/9RIhSoRTSESihSgGF2KOjqbhVUtDSt3qiqkEcfcwcXSO5NGSf/6uBoc5zGMa58kjmsjYxpc973HAa1o1JPYtW2R2aFngdWVjWm6VTA14BDhSwnXoWnhntefZwGsPKyVRD8vsTMTGd8/wu5YbfQ09toqOhpx/BpYWRNPa4gauPMnJPiqT5Qbo3dorPE4Ekitq8djRlsTDjv1cfAd6udyuNLa6Kprql38OFuWtBw6WQ6NjZzJ/3osTraypuFVVVtS7enqZXSPxnA7A1uewDAHgqjT6XbZ9WXZfLLjUb1VX9KPd/wDB1ioUoFozNjC0Lyc0pDL1XkaOkgo4zyjaZX49rh7lnhIDXOPBoJPfotp2XtxttjttO9uJ3x+c1A7RLOekLT4ZA9iq9Ss8NPh9S00yrxXeJ/se0pRFnDThERAEREAREQBERAEREAREQBQpRAV/ay0uutnqGRN3qqlPndNgaucwHeYPxDI8cLHAQRkcCv0EVkm2NjNruLqmBmKG4OfLHj0Ypj1nxae9vI4/sq50y/Z/Sf8ABR6pj7pXL+SsL7hmnglZNBLJFNGd5kkTnMe08nN1XwivWk1sygTae6L5ZdvZY9ynvTDKzRorIGjpBzliGh8R7ir/AEtZRV0DKikqIp4H+jJE4OGe444HvCwRdy33K5Wubp6Cokhk/thpzHIO6Rh6p9yqsjTYT5r4fwW+PqcodNvK+TaLjarXdoDBXU0czcHccctkjPfHI3rA+1Z1edh7lQ789tLq2mGSY8AVcY/CNHDw15KwWXbq31m5T3RraKpOglBJpJD+I6t9unNXIOa4Nc0gtcA5pByCDqCCNFWRtvw5bP8A8LSVWPmx3X/p+fiCC5pBDmkhwIILSNCCDqEWzXnZezXoOkmj6Grx1aqnAbL/ANY9Fw8R7lmN82dudiezzkxS00r3MgqIjgPIGSHMOoPvHNXWNnQv6ezKPJwbKOrujxkRFPIBD/Qk/C79lv1J9Fo/V4fgCwF/oSfhd+y36k+i0fq8HwBUmq9ol5pHeRnXlF+sLT6lJ80qkK7+UX6wtPqUnzSqQp2F5ESBn/qJEIi+msc9zGMaXPe9scbW8XvcQ1rR4lTCFtuQu7bbVdLvN0NupnTYOJJXdWnh/qSkY9gyeSuVl2ALujqL7IMcRQ07zu+E8zdTzDfeVfYKalpIY4KaKOGGMYZHC0MY0cg3RVORqUY8Vcv1LjG0yU+q3hFd2d2RorKW1VQ5tVcSCBMW4jgB4tgYc45k6nlwVjnnp6aGaoqJWRQQsL5ZHnDWtHaSupc7xarRCJa6dseQTHE3rTykdkcY19vDmsr2g2lr75IGEGChjdvQ0zXZyRwfM4cXfoOzvNdVRbmT8Uu3r/0WVt9WHDwx7+n/AGfW020Ut9qgIt5lvp3OFLEcgvJ0M0g/vHsHYPE5r6KFpKq41RUI9kZm2yVsnOXdhSETB0ABcSQ1rWjJc4nAAHeexdDme1sxajd7zSQObvU1ORWVmeHRxnLWH8RwPDK2gcFXtk7H/wAFtoEwHn9YW1FYRruHGGQg9zRp4k96sSyubf8AWs47Lsa3Bx/o1892ERFCJwREQBERAEREAREQBERAEREAREQEFdK6W6kutFUUNU3+HMOq4Y34pBq2RnMf74rvIvqbT3R8lFSWzMKulsrrRWS0VY3D2daORo/hzRE4bIzkf04di6K2+9WWgvdKaaqbh7cupp2Y6WCQjG80nsPaO39RkV3stzss/Q1kfUc4iCpjB6CcD+6ew94OvjxWlxMyNy8Mvu/5MtmYUqH4o/aeYpRFYFcF7Nn2kvNlc1tPL0tLnLqSoJdCe/cPFp8PcV4yheZ1xsXhktz3CyVb8UHsbJZdqrPedyJj/Nqw4zTVBAc4/dP9F378l4nlG+hWf1yb5Szfu5agjiDyK9CrvF0rqOloquodPFSyOkhfL1pm5bu7pfxI7s+9VkdPVV0bIPgs5ai7KZV2LlnnIiK2Kkh/oSfhd+y36k+i0fq8PwBYC/0JPwu/Zb9SfRaP1eH4AqTVe0S80jvIzryi/WFp9Sk+aVSFd/KL9YWn1KT5pVIU7C8iJAz/ANRIhdmhx59bPX6L57F1lywyOhlgmaGl0E0UzA8EtLo3h43gOzRS5LdbIiQe0kzeKmppaOGSoqp4oIGavkmcGtHLJ7e5UK9bfPdvwWWPdbqDW1DesecMTv3d7lTbldbndpunr6l8rgT0bPRiiB7I4x1R+66Sq8fTYw6reX8FrkanOfTVwvk5Z56mpmknqJpJppDl8kri97vEn9FxFFCtUklsiobbe7CIpOmM9pAA4kk6AADVfQluNBkngOOVfditmXufDe7hGQ0da2wSDXP/ALl4P+Qe3tC+dmNi5JXQ3G9RFkTS2SmoZB1nkaiSpHd3N9/ctHVFnZqf+1W/dl9gYLT+pYvYYUoipS9CIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgH++C4KmlpKuGSnqoY5oJBh8crQ5rvYf0XOiJ7co+NJ8Mzm9bAyx9JPZJC9mrjR1DusOUMp/QO96os0M9PK+CeKSGaM4fFMwskb4tOq39ebdLLabxF0ddTte5v/LmZ1J4ubJBr7OCtcfUpQ6bOUVORpkZ9VfD+DD0VpvWxd3tnST0m9XUYycxN/mY2/eRDj4j3BVbj7CQfEK9ruhat4PcoLaZ0vaa2CIoXU5EooRAQ/0JPwu/Zb9SfRaP1eD4AsBf6En4Xfst+pPotH6vD8AVJqvaJeaR3kZ15RfrC0+pSfNKpBV38ov1hafUpPmlUhTsLyI//epAz/1EgihFNIRKKFKAJ+3bldmhoLjcp/NqCmkqJhjfDAAyMHtlkd1QPErQrLsFRU25PeHsrJwQ4U7N4UkZ49YHDnHxwOSi35VdH3Pn0JdGJZe+lcepSbRs/eb28eZQbtPnD6ucFlO3v3TxceQHuWlWPZCz2cx1DgauuaNKmdoxGfuI+Df1PNWJjGRtYyNrWMYA1jWANa1o0AaBphfSoMjOsu4XCNBj4FdPPdkYUoiglgEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERACq5etkrPeOkm3PNa08KmnA65++j9F36HmrGi9wslW/FB7HOyuNi8MluYneNnrzZXE1UO/Tb2GVcGXQO7BvHi08j7yvIK/QL2Me1zHta5jgQ5rgC1wPEEHRUq9bB0NT0lRaHNpJyS4wOz5q88eqBq0+GnJXWPqSfTbx+SjydLa6qefwZki7Vdb7hbJvN6+mkgl13Q8ZZIB2xvHVI8CusriMlJbopZRcXsz5f6En4Xfst+pPotH6vD8AWAvxuSfhd+y36k+i0fq8HwBU2q9ol3pPeRnXlF+sLT6lJ80qkK7+UX6wtPqUnzSqQp2F5ESBn/qJEKVBLRqTjs9vcFZ7LsberqWTVIdQURw7fmZ/Myt+7idwz3u9xUi22FUfFN7Eeqmdr2giuRxyyyRwwxySzSHdjiia58jz3Na3VXazbA1U+5UXqR0EWjm0dM4dM4d00oyB4N96u1psNmssXR0NOGvcAJZ5OvUS/jkOvsGByXqaKjyNSlPpq4XyX2PpkYdVnLOtRUNDb4GU1HTxU8DPRZE0NGe8955ldlEVS2292W6SS2QREQ+hERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQBERAEREAREQHVrKGhuED6esp454XcWSNBwe9p4g9xCz69bBVUHSVFmeZ4tSaSZ2JmDuikOh8Dg8ytLUKRTkWUvof8Ea/GruXWv5Pz7OyWIzxSxvjljDmyRytcx7Djg5rtVvlJ9Fo/V4PgC8+72Cz3uJ0dbAOk3S2Ooi6lRHn+68DhyORyXpwxiKKKIEkRsZGCeJDQG5OF3y8tZEY8bNEbDxHjSlzumZv5RfrC0+pSfNKr1o2fvV7c11HDu029h9ZOC2nb37na48h7wtVuGz1puldSV1fG6c0sJiige7+XOX7+89g4nkTjkvWY1jGtYxrWsaA1rWgANA4AAaLrDPdVKrguTnPT1bdKyb4K7ZdkLNaNyZzfO64DPnNS0HcPb0MerW/qeasiIq6yyVj8U3uyyhXGteGC2CIi8HQIiIAiIgCIiAIiIAiIgCIiAIiIAiIgJUIiAIiIAiIgClEQEIiIAiIgCIiAlQiIAiIgCYREAwmERAEwiIAiIgCIiAlERAQiIgCIiAIiICVCIgCIiAIiIAiIgP/Z" },
  { name: "Rhino", image: "https://th.bing.com/th/id/OIP.7ZOZhnlgL6ovivqqDaHs7gHaHC?w=205&h=195&c=7&r=0&o=5&dpr=1.4&pid=1.7" },
  { name: "Rhino CAM", image: "https://i0.wp.com/www.forida.com.au/wp-content/uploads/2024/04/RhinoCAM-box_512.png?w=512&ssl=1" },
  { name: "Grasshopper", image: "https://tse1.mm.bing.net/th/id/OIP.EZawwpYVIv6F1_-jjVv9aAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3" },
  { name: "PowerMILL", image: "https://th.bing.com/th/id/OIP.79sxD_e6WbsJwK9pKUvX4AAAAA?w=150&h=180&c=7&r=0&o=5&dpr=1.4&pid=1.7https://th.bing.com/th/id/OIP.Xn7c9F-FZkfZnkfD1u9ZZgAAAA?w=144&h=153&c=7&r=0&o=5&dpr=1.4&pid=1.7" },
];

const Portfolio: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("الكل");
  // console.log("Active Category:", activeCategory);

  const filteredProjects = activeCategory === "الكل" 
    ? projects 
    : projects.filter(project => project.category === activeCategory);

  return (
    <section id="portfolio" className="scroll-mt-28 py-20 bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <div className="container mx-auto px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 flex items-center justify-center gap-3">
            <Layers className="text-primary-600" />
            معرض الأعمال
          </h2>
          <div className="w-24 h-1 bg-primary-600 mx-auto rounded-full"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            جولة في أحدث مشاريعنا التي تم تنفيذها باستخدام أحدث برامج التصميم الهندسي.
          </p>
        </div>

        {/* Filter Buttons (Image-based) */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {categories.map((cat) => (
            <div
              key={cat.name} // تم التعديل هنا من id إلى name
              onClick={() => setActiveCategory(cat.name)}
              className={`group cursor-pointer flex flex-col items-center transition-all duration-300 ${
                activeCategory === cat.name ? 'scale-110' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`relative w-20 h-20 mb-3 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                activeCategory === cat.name 
                  ? 'border-primary-600 shadow-xl shadow-primary-500/20' 
                  : 'border-transparent bg-gray-100 dark:bg-gray-800'
              }`}>
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                
                {/* {activeCategory === cat.name && (
                  <div className="absolute inset-0 bg-primary-600/10 flex items-center justify-center">
                     <div className="bg-primary-600 text-white p-1 rounded-full shadow-lg">
                        <Sparkles size={12} />
                     </div>
                  </div>
                )} */}
              </div>

              <span className={`text-sm font-bold transition-colors ${
                activeCategory === cat.name 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {cat.name}
              </span>
            </div>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-white bg-primary-600 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {project.category}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">
                  {project.title}
                </h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    برنامج: {project.category}
                  </span>
                  <button className="text-primary-500 hover:text-primary-600 p-2 rounded-full hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors">
                    <ExternalLink size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
            لا توجد مشاريع في قسم {activeCategory} حالياً.
          </div>
        )}
      </div>
    </section>
  );
};

export default Portfolio;